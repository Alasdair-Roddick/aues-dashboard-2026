import axios from "axios";
import { db } from "../db/index";
import { siteSettings, squarespaceOrders, squarespaceOrderItems } from "../db/schema";
import { decrypt } from "./encryption";
import { eq, inArray, isNull } from "drizzle-orm";

// Types for Squarespace API responses
interface SquarespaceLineItem {
  id: string;
  productName: string;
  quantity: number;
  variantOptions?: Array<{
    optionName: string;
    value: string;
  }>;
  imageUrl?: string;
}

interface SquarespaceOrder {
  id: string;
  orderNumber: string; // Customer-facing order number (e.g., "1001234")
  customerEmail: string;
  billingAddress?: {
    firstName: string;
    lastName: string;
  };
  fulfillmentStatus: "PENDING" | "FULFILLED" | "CANCELED";
  createdOn: string;
  lineItems: SquarespaceLineItem[];
}

interface SquarespaceOrdersResponse {
  result: SquarespaceOrder[];
  pagination?: {
    nextPageCursor?: string;
    nextPageUrl?: string;
    hasNextPage: boolean;
  };
}

interface SquarespaceSettings {
  squarespaceApiKey: string | null;
  squarespaceApiUrl: string | null;
  squarespaceApiVersion: string | null;
  pubcrawlShirtKeyword: string | null;
  lastSquarespaceOrderDate: Date | null;
  settingsId: number | null;
}

// Cache for settings
let settingsCache: SquarespaceSettings | null = null;
let settingsCacheTime = 0;
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

async function getSquarespaceSettings(): Promise<SquarespaceSettings> {
  if (settingsCache && Date.now() - settingsCacheTime < CACHE_TTL) {
    return settingsCache;
  }

  try {
    const settings = await db.select().from(siteSettings).limit(1);

    if (settings.length > 0) {
      settingsCache = {
        squarespaceApiKey: settings[0].squarespaceApiKey
          ? decrypt(settings[0].squarespaceApiKey)
          : null,
        squarespaceApiUrl: settings[0].squarespaceApiUrl
          ? decrypt(settings[0].squarespaceApiUrl)
          : null,
        squarespaceApiVersion: settings[0].squarespaceApiVersion
          ? decrypt(settings[0].squarespaceApiVersion)
          : null,
        pubcrawlShirtKeyword: settings[0].pubcrawlShirtKeyword
          ? decrypt(settings[0].pubcrawlShirtKeyword)
          : null,
        lastSquarespaceOrderDate: settings[0].lastSquarespaceOrderDate,
        settingsId: settings[0].id,
      };
      settingsCacheTime = Date.now();
      return settingsCache;
    }
  } catch (error) {
    console.error("Failed to fetch Squarespace settings from database:", error);
  }

  return {
    squarespaceApiKey: null,
    squarespaceApiUrl: null,
    squarespaceApiVersion: null,
    pubcrawlShirtKeyword: null,
    lastSquarespaceOrderDate: null,
    settingsId: null,
  };
}

// Clear settings cache (call after updating lastSquarespaceOrderDate)
function clearSettingsCache() {
  settingsCache = null;
  settingsCacheTime = 0;
}

export function invalidateSquarespaceSettingsCache() {
  clearSettingsCache();
}

// Update the last order date in settings
async function updateLastOrderDate(date: Date, settingsId: number) {
  try {
    await db
      .update(siteSettings)
      .set({ lastSquarespaceOrderDate: date, updatedAt: new Date() })
      .where(eq(siteSettings.id, settingsId));
    clearSettingsCache();
    console.log(`Updated lastSquarespaceOrderDate to: ${date.toISOString()}`);
  } catch (error) {
    console.error("Failed to update lastSquarespaceOrderDate:", error);
  }
}

// Map Squarespace status to our internal status
function mapFulfillmentStatus(sqStatus: string): "PENDING" | "PACKED" | "FULFILLED" {
  switch (sqStatus) {
    case "FULFILLED":
      return "FULFILLED";
    case "CANCELED":
      return "FULFILLED"; // Treat canceled as fulfilled (won't be packed/collected)
    default:
      return "PENDING";
  }
}

// Incremental fetch - only gets orders newer than startDate, stops early when hitting old orders
export async function fetchOrdersFromSquarespace(startDate?: Date): Promise<{
  orders: SquarespaceOrder[];
  latestOrderDate: Date | null;
}> {
  const settings = await getSquarespaceSettings();

  if (!settings.squarespaceApiKey) {
    throw new Error(
      "Squarespace API key is not configured. Please configure it in Admin > Settings.",
    );
  }

  // Build the URL
  let ordersUrl: string;
  const customUrl = settings.squarespaceApiUrl;

  if (customUrl && customUrl.includes("/commerce/orders")) {
    ordersUrl = customUrl;
  } else {
    const baseUrl = customUrl || "https://api.squarespace.com";
    const apiVersion = settings.squarespaceApiVersion || "1.0";
    ordersUrl = `${baseUrl.replace(/\/$/, "")}/${apiVersion}/commerce/orders`;
  }

  const allOrders: SquarespaceOrder[] = [];
  let nextPageUrl: string | undefined = ordersUrl;
  let shouldContinue = true;
  let latestOrderDate: Date | null = null;

  console.log(
    `Fetching orders${startDate ? ` since ${startDate.toISOString()}` : " (full sync)"}...`,
  );

  try {
    while (nextPageUrl && shouldContinue) {
      const resp = await axios.get(nextPageUrl, {
        headers: {
          Authorization: `Bearer ${settings.squarespaceApiKey}`,
          "Content-Type": "application/json",
          "User-Agent": "AUES Dashboard",
        },
      });

      const data = resp.data as SquarespaceOrdersResponse;
      const orders = data.result || [];
      console.log(`Fetched page with ${orders.length} orders`);

      for (const order of orders) {
        const orderDate = new Date(order.createdOn);

        // Track the latest order date
        if (!latestOrderDate || orderDate > latestOrderDate) {
          latestOrderDate = orderDate;
        }

        // If we have a startDate and this order is older, stop pagination
        if (startDate && orderDate < startDate) {
          console.log(`Order ${order.id} is older than start date, stopping pagination`);
          shouldContinue = false;
          break;
        }

        allOrders.push(order);
      }

      // Get next page URL
      if (data.pagination?.hasNextPage && shouldContinue) {
        nextPageUrl =
          data.pagination.nextPageUrl ||
          (data.pagination.nextPageCursor
            ? `${ordersUrl}?cursor=${data.pagination.nextPageCursor}`
            : undefined);
      } else {
        nextPageUrl = undefined;
      }
    }

    console.log(`Fetched ${allOrders.length} orders from Squarespace`);
    return { orders: allOrders, latestOrderDate };
  } catch (error: unknown) {
    if (axios.isAxiosError(error)) {
      console.error(
        "Failed to fetch orders from Squarespace:",
        error.response?.data || error.message,
      );
      throw new Error(
        `Failed to fetch orders from Squarespace: ${error.response?.data?.message || error.message}`,
      );
    }
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("Failed to fetch orders from Squarespace:", message);
    throw new Error(`Failed to fetch orders from Squarespace: ${message}`);
  }
}

// Get the size from variant options
function getSizeFromLineItem(item: SquarespaceLineItem): string | null {
  if (!item.variantOptions) return null;

  const sizeOption = item.variantOptions.find((opt) => opt.optionName.toLowerCase() === "size");

  return sizeOption?.value || null;
}

// Filter orders to only include those with products matching the keyword
function filterOrdersByKeyword(orders: SquarespaceOrder[], keyword: string): SquarespaceOrder[] {
  return orders
    .map((order) => {
      const matchingItems = order.lineItems.filter((item: SquarespaceLineItem) =>
        item.productName.toLowerCase().includes(keyword.toLowerCase()),
      );

      if (matchingItems.length === 0) return null;

      return {
        ...order,
        lineItems: matchingItems,
      };
    })
    .filter((order): order is SquarespaceOrder => order !== null);
}

// Fetch shirt orders for preview (without writing to DB)
export async function fetchShirtOrders(keyword?: string) {
  const settings = await getSquarespaceSettings();
  const shirtKeyword = keyword || settings.pubcrawlShirtKeyword;

  if (!shirtKeyword) {
    throw new Error(
      "Pub crawl shirt keyword is not configured. Please configure it in Admin > Settings.",
    );
  }

  const { orders: allOrders } = await fetchOrdersFromSquarespace();
  const filteredOrders = filterOrdersByKeyword(allOrders, shirtKeyword);

  return filteredOrders.map((order) => ({
    id: order.id,
    orderNumber: order.orderNumber,
    customerEmail: order.customerEmail,
    customerName: order.billingAddress
      ? `${order.billingAddress.firstName} ${order.billingAddress.lastName}`
      : "Unknown",
    fulfillmentStatus: mapFulfillmentStatus(order.fulfillmentStatus),
    createdOn: new Date(order.createdOn),
    lineItems: order.lineItems.map((item) => ({
      id: item.id,
      productName: item.productName,
      quantity: item.quantity,
      size: getSizeFromLineItem(item),
      imageUrl: item.imageUrl || null,
    })),
  }));
}

// Sync orders to database with incremental fetching
export async function syncShirtOrdersToDatabase(
  keyword?: string,
): Promise<{ added: number; updated: number }> {
  const settings = await getSquarespaceSettings();
  const shirtKeyword = keyword || settings.pubcrawlShirtKeyword;

  if (!shirtKeyword) {
    throw new Error(
      "Pub crawl shirt keyword is not configured. Please configure it in Admin > Settings.",
    );
  }

  // Calculate start date for incremental fetch
  let startDate: Date | undefined;
  const hasMissingOrderNumbers = await db
    .select({ id: squarespaceOrders.id })
    .from(squarespaceOrders)
    .where(isNull(squarespaceOrders.orderNumber))
    .limit(1);

  if (hasMissingOrderNumbers.length > 0) {
    // One-time backfill so old rows get customer-facing Squarespace order numbers.
    console.log("Full sync: backfilling missing Squarespace order numbers");
  } else if (settings.lastSquarespaceOrderDate) {
    startDate = new Date(settings.lastSquarespaceOrderDate);
    startDate.setDate(startDate.getDate() - 1); // Go back 1 day for safety
    console.log(`Incremental sync: fetching orders since ${startDate.toISOString()}`);
  } else {
    console.log(`Full sync: no previous sync date found`);
  }

  // Fetch orders from Squarespace (incremental or full)
  const { orders: allOrders, latestOrderDate } = await fetchOrdersFromSquarespace(startDate);

  // Filter to only matching shirt orders
  const orders = filterOrdersByKeyword(allOrders, shirtKeyword);
  console.log(`Found ${orders.length} orders containing "${shirtKeyword}"`);

  let added = 0;
  let updated = 0;
  const syncedOrderIds: string[] = [];
  const allItemsToInsert: Array<typeof squarespaceOrderItems.$inferInsert> = [];

  // Load existing order statuses once to avoid per-order lookups.
  const existingOrders = await db
    .select({
      id: squarespaceOrders.id,
      fulfillmentStatus: squarespaceOrders.fulfillmentStatus,
    })
    .from(squarespaceOrders);
  const existingOrderMap = new Map(
    existingOrders.map((order) => [order.id, order.fulfillmentStatus]),
  );

  for (const order of orders) {
    const customerName = order.billingAddress
      ? `${order.billingAddress.firstName} ${order.billingAddress.lastName}`
      : "Unknown";

    const orderData = {
      id: order.id,
      orderNumber: order.orderNumber,
      customerEmail: order.customerEmail,
      customerName,
      fulfillmentStatus: mapFulfillmentStatus(order.fulfillmentStatus),
      createdOn: new Date(order.createdOn),
      syncedAt: new Date(),
    };

    const existingStatus = existingOrderMap.get(order.id);
    if (existingStatus) {
      // Update existing order (but preserve our internal status if we've modified it)
      // Only update fulfillment status if it's still PENDING (we haven't touched it)
      const updateData =
        existingStatus === "PENDING"
          ? orderData
          : { ...orderData, fulfillmentStatus: existingStatus };

      await db.update(squarespaceOrders).set(updateData).where(eq(squarespaceOrders.id, order.id));

      updated++;
    } else {
      // Insert new order
      await db.insert(squarespaceOrders).values(orderData);
      existingOrderMap.set(order.id, orderData.fulfillmentStatus);
      added++;
    }

    syncedOrderIds.push(order.id);

    const itemsToInsert = order.lineItems.map(
      (item: SquarespaceLineItem): typeof squarespaceOrderItems.$inferInsert => ({
        orderId: order.id,
        productName: item.productName,
        quantity: item.quantity,
        size: getSizeFromLineItem(item),
        imageUrl: item.imageUrl || null,
      }),
    );

    if (itemsToInsert.length > 0) {
      allItemsToInsert.push(...itemsToInsert);
    }
  }

  if (syncedOrderIds.length > 0) {
    await db
      .delete(squarespaceOrderItems)
      .where(inArray(squarespaceOrderItems.orderId, syncedOrderIds));

    const chunkSize = 500;
    for (let i = 0; i < allItemsToInsert.length; i += chunkSize) {
      await db.insert(squarespaceOrderItems).values(allItemsToInsert.slice(i, i + chunkSize));
    }
  }

  // Update the last order date for next incremental sync
  if (latestOrderDate && settings.settingsId) {
    await updateLastOrderDate(latestOrderDate, settings.settingsId);
  }

  console.log(`Synced orders: ${added} added, ${updated} updated`);
  return { added, updated };
}

// Get all shirt orders from database
export async function getShirtOrdersFromDatabase() {
  const orders = await db.select().from(squarespaceOrders);

  const items = await db.select().from(squarespaceOrderItems);

  // Group items by order
  const itemsByOrder = items.reduce(
    (acc, item) => {
      if (!acc[item.orderId]) {
        acc[item.orderId] = [];
      }
      acc[item.orderId].push(item);
      return acc;
    },
    {} as Record<string, typeof items>,
  );

  return orders.map((order) => ({
    ...order,
    items: itemsByOrder[order.id] || [],
  }));
}

// Get aggregated shirt counts by size
export async function getShirtSizeCounts() {
  const orders = await getShirtOrdersFromDatabase();

  const sizeCounts: Record<string, Record<string, number>> = {};

  for (const order of orders) {
    for (const item of order.items) {
      const productName = item.productName;
      const size = item.size || "Unknown";

      if (!sizeCounts[productName]) {
        sizeCounts[productName] = {};
      }

      if (!sizeCounts[productName][size]) {
        sizeCounts[productName][size] = 0;
      }

      sizeCounts[productName][size] += item.quantity;
    }
  }

  return sizeCounts;
}

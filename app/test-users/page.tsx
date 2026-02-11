import { db } from "@/app/db";
import { users } from "@/app/db/schema";

export default async function TestUsersPage() {
  const allUsers = await db.select().from(users);

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Test Users</h1>
      <ul>
        {allUsers.map((user) => (
          <li key={user.id} className="mb-2">
            <strong>Name:</strong> {user.name} <br />
            <strong>Role:</strong> {user.role} <br />
            <strong>Active:</strong> {user.isActive ? "Yes" : "No"} <br />
            <strong>Created At:</strong> {new Date(user.createdAt).toLocaleString()} <br />
            <strong>Updated At:</strong> {new Date(user.updatedAt).toLocaleString()}
          </li>
        ))}
      </ul>
    </div>
  );
}

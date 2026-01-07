import { getAllMembers } from "../lib/memberships/memberships"
import { Metadata } from "next"
import { DataTable } from "./data-table"

export const metadata: Metadata = {
    title: "Members - AUES Dashboard"
}

export default async function MembersPage() {
    const members = await getAllMembers()

    const data = members.map((member) => ({
        id: member.id,
        fullname: member.fullname,
        email: member.email,
        phonenumber: member.phonenumber,
        membershipId: member.membershipId,
        membershipType: member.membershipType,
        pricePaid: member.pricePaid,
        paymentMethod: member.paymentMethod,
        isValid: member.isValid,
        createdAt: member.createdAt,
        updatedAt: member.updatedAt,
    }))

    return (
        <div className="flex-1 space-y-4 p-8 pt-6">
            <div className="flex items-center justify-between space-y-2">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Members</h2>
                    <p className="text-muted-foreground">
                        View and manage all club members and their memberships.
                    </p>
                </div>
            </div>
            <DataTable data={data} />
        </div>
    )
}
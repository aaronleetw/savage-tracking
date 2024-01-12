import { api } from "~/utils/api";

export default function UserList() {
    const users = api.admin.getAllUsersAttendTime.useQuery();

    return <table className="table-auto border-collapse border-2 border-black w-fit">
        <thead>
            <tr className="*:p-1 *:border border-b-2 border-b-black">
                <th>Username</th>
                <th>Grade</th>
                <th>Class</th>
                <th>Number</th>
                <th>Name</th>
                <th>Display Name</th>
                <th>Selected Time</th>
                <th>Actual Time</th>
                <th>Projected Time</th>
            </tr>
        </thead>
        <tbody>
            {
                users.data?.map((user) => (
                    <tr className={`*:p-1 *: ${(user.selectedTime + user.actualTime) >= 95 ? "*:bg-emerald-200" : "*:bg-red-100"}`} key={user.username}>
                        <td>{user.username}</td>
                        <td>{user.grade}</td>
                        <td>{user.class}</td>
                        <td>{user.number}</td>
                        <td>{user.name}</td>
                        <td>{user.dname}</td>
                        <td>{user.selectedTime}</td>
                        <td>{user.actualTime.toFixed(2)}</td>
                        <td >{(user.selectedTime + user.actualTime).toFixed(2)}</td>
                    </tr>
                ))
            }
        </tbody>
    </table>

}
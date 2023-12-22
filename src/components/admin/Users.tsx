import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { SubmitHandler, useForm } from "react-hook-form";
import { z } from "zod";
import { api } from "~/utils/api";
import { AddTimePeriodSchema, AddUserSchema } from "~/utils/types";

export default function Users() {
    const users = api.admin.getAllUsers.useQuery();
    const addUser = api.admin.addUser.useMutation();
    const resetPassword = api.admin.resetPassword.useMutation();
    const toggleAdmin = api.admin.toggleUserIsAdmin.useMutation();
    const toggleRosterOnly = api.admin.toggleUserRosterOnly.useMutation();

    type AddUserSchemaType = z.infer<typeof AddUserSchema>;
    const { register, handleSubmit, formState: { errors } } = useForm<AddUserSchemaType>({ resolver: zodResolver(AddUserSchema) });
    const onSubmit: SubmitHandler<AddUserSchemaType> = async (data, event) => addUser.mutateAsync(data).then(() => {
        event?.target.reset();
        users.refetch();
    }).catch((err) => console.log(err));

    return (<div>
        <section>
            <div>
                <table className="table-auto border-collapse border-2 border-black w-fit">
                    <thead>
                        <tr className="*:p-1 *:border border-b-2 border-b-black">
                            <th>Username</th>
                            <th>Grade</th>
                            <th>Class</th>
                            <th>Number</th>
                            <th>Name</th>
                            <th>RFID</th>
                            <th>Admin?</th>
                            <th>Roster Only?</th>
                            <th>Operation</th>
                        </tr>
                    </thead>
                    <tbody>
                        {
                            users.data?.map((user) => (
                                <tr className="*:p-1 *:border" key={user.username}>
                                    <td>{user.username}</td>
                                    <td>{user.grade}</td>
                                    <td>{user.class}</td>
                                    <td>{user.number}</td>
                                    <td>{user.name}</td>
                                    <td>{user.rfid}</td>
                                    <td className="text-sky-600 underline text-center hover:cursor-pointer"
                                        onClick={() => toggleAdmin.mutateAsync(user.username).then(() => users.refetch())}
                                    >{user.isAdmin ? "V" : "X"}</td>
                                    <td className="text-sky-600 underline text-center hover:cursor-pointer"
                                        onClick={() => toggleRosterOnly.mutateAsync(user.username).then(() => users.refetch())}
                                    >{user.rosterOnly ? "V" : "X"}</td>
                                    <td className="text-center">
                                        <button className="p-1 px-2 bg-yellow-600 text-white rounded-lg" onClick={(evt) => {
                                            evt.preventDefault();
                                            resetPassword.mutateAsync(user.username)
                                                .then(() => alert(`Password reset for ${user.username} to password.`))
                                                .catch((err) => alert(err))
                                        }} type="button">Reset Password</button>
                                    </td>
                                </tr>
                            ))
                        }
                    </tbody>
                </table>
            </div>
        </section>
        <p className="my-2">For editing rows, please use backend SQL.</p>
        <p className="my-2">Roster Only users must also be Admin.</p>
        <hr />
        <h2 className="text-xl mt-5 mb-2 font-bold">Create new user</h2>
        <form onSubmit={handleSubmit(onSubmit)}>
            <div className="mb-5">
                <label className="block text-md font-medium text-gray-700 mt-2">Username</label>
                <input type="text" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-300 focus:ring focus:ring-emerald-200 focus:ring-opacity-70" {...register("username")} />
                {errors.username && <span className="text-red-500">{errors.username.message}</span>}
            </div>
            <div className="mb-5">
                <label className="block text-md font-medium text-gray-700 mt-2">Grade</label>
                <input type="text" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-300 focus:ring focus:ring-emerald-200 focus:ring-opacity-70" {...register("grade")} />
                {errors.grade && <span className="text-red-500">{errors.grade.message}</span>}
            </div>
            <div className="mb-5">
                <label className="block text-md font-medium text-gray-700 mt-2">Class</label>
                <input type="text" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-300 focus:ring focus:ring-emerald-200 focus:ring-opacity-70" {...register("class")} />
                {errors.class && <span className="text-red-500">{errors.class.message}</span>}
            </div>
            <div className="mb-5">
                <label className="block text-md font-medium text-gray-700 mt-2">Number</label>
                <input type="text" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-300 focus:ring focus:ring-emerald-200 focus:ring-opacity-70" {...register("number")} />
                {errors.number && <span className="text-red-500">{errors.number.message}</span>}
            </div>
            <div className="mb-5">
                <label className="block text-md font-medium text-gray-700 mt-2">Name</label>
                <input type="text" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-300 focus:ring focus:ring-emerald-200 focus:ring-opacity-70" {...register("name")} />
                {errors.name && <span className="text-red-500">{errors.name.message}</span>}
            </div>
            <button className="bg-emerald-600 px-3 py-2 rounded text-white focus:ring focus:ring-emerald-200 focus:ring-opacity-70 disabled:bg-emerald-400 mb-5" disabled={addUser.isLoading}>
              Add User
            </button>
            <p>Default password is <code className="bg-gray-600 text-white p-1 rounded">password</code>.</p>
        </form>
        {addUser.isError && <p className="text-red-500">{addUser.error.message}</p>}
    </div>)
}
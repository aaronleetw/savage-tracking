import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { SubmitHandler, useForm } from "react-hook-form";
import { z } from "zod";
import { api } from "~/utils/api";
import { AddAttendance } from "~/utils/types";

export default function ListView() {
    const today = new Date();
    
    const [startDate, setStartDate] = useState(`${today.getFullYear()}-${today.getMonth() + 1}-${today.getDate()}`);
    const [endDate, setEndDate] = useState(`${today.getFullYear()}-${today.getMonth() + 1}-${today.getDate()}`);
    const attendanceData = api.admin.getAttendanceFromRange.useQuery({
        start: startDate,
        end: endDate
    });
    const deleteAttendanceRecord = api.admin.deleteAttendanceRecord.useMutation();
    const addAttendanceRecord = api.admin.addAttendanceRecord.useMutation();

    type AddAttendanceType = z.infer<typeof AddAttendance>;
    const { register, handleSubmit, formState: { errors } } = useForm<AddAttendanceType>({ resolver: zodResolver(AddAttendance) });
    const onSubmit: SubmitHandler<AddAttendanceType> = async (data, event) => addAttendanceRecord.mutateAsync(data).then(() => {
        event?.target.reset();
        attendanceData.refetch();
    }).catch((err) => console.log(err));


    return <div className="block">
        <div className="flex gap-5 items-center mb-5">
            <label className="block max-w-72">
                <span className="text-gray-700">Start Date</span>
                <input type="date" className="block w-full mt-1 rounded-md border-gray-300 shadow-sm focus:border-emerald-300 focus:ring focus:ring-emerald-200 focus:ring-opacity-50"
                    onChange={(evt) => {
                        setStartDate(evt.target.value);
                        attendanceData.refetch().catch((err) => console.log(err));
                    }} value={startDate}>
                </input>
            </label>
            <label className="block max-w-72">
                <span className="text-gray-700">End Date</span>
                <input type="date" className="block w-full mt-1 rounded-md border-gray-300 shadow-sm focus:border-emerald-300 focus:ring focus:ring-emerald-200 focus:ring-opacity-50"
                    onChange={(evt) => {
                        setEndDate(evt.target.value);
                        attendanceData.refetch().catch((err) => console.log(err));
                    }} value={endDate}>
                </input>
            </label>
            <button className="p-2 px-3 h-fit bg-emerald-600 text-white rounded-lg"
                onClick={() => {
                    setStartDate(`${today.getFullYear()}-${today.getMonth() + 1}-${today.getDate()}`);
                    setEndDate(`${today.getFullYear()}-${today.getMonth() + 1}-${today.getDate()}`);
                }}>Today</button>
            {
                (attendanceData.isLoading) && <div role="status">
                    <svg aria-hidden="true" className="w-8 h-8 text-gray-200 animate-spin dark:text-gray-600 fill-emerald-600" viewBox="0 0 100 101" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z" fill="currentColor" />
                        <path d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z" fill="currentFill" />
                    </svg>
                    <span className="sr-only">Loading...</span>
                </div>
            }
        </div>
        <table className="table-auto border-collapse w-fit border-2 border-black my-5">
            <thead>
                <tr className="*:p-1 *:border border-b-2 border-b-black">
                    <th>Time</th>
                    <th>Username</th>
                    <th>Grade</th>
                    <th>Class</th>
                    <th>Number</th>
                    <th>Name</th>
                    <th>Operation</th>
                </tr>
            </thead>
            <tbody>
                {

                    attendanceData.data?.map((attendance) => {
                        return (<tr className="*:p-1 *:border" key={attendance.id}>
                            <td>{attendance.datetime.toLocaleString()}</td>
                            <td>{attendance.user.username}</td>
                            <td>{attendance.user.grade}</td>
                            <td>{attendance.user.class}</td>
                            <td>{attendance.user.number}</td>
                            <td>{attendance.user.name}</td>
                            <td>
                                <button className="p-1 px-2 bg-red-600 text-white rounded-lg" onClick={(evt) => {
                                    evt.preventDefault();
                                    deleteAttendanceRecord.mutateAsync(attendance.id).then(() => attendanceData.refetch());
                                }} type="button">Delete</button>
                            </td>
                        </tr>)
                    })
                }
            </tbody>
        </table>
        <h3 className="my-2 font-bold text-lg">Create new record</h3>
        <form onSubmit={handleSubmit(onSubmit)}>
            <div className="flex gap-5 items-end mb-2">
                <label className="block max-w-72">
                    <span className="text-gray-700">Username</span>
                    <input type="text" className="block w-full mt-1 rounded-md border-gray-300 shadow-sm focus:border-emerald-300 focus:ring focus:ring-emerald-200 focus:ring-opacity-50"
                        {...register("username")} />
                    {errors.username && <p className="text-red-500">{errors.username.message}</p>}
                </label>
                <label className="block max-w-72">
                    <span className="text-gray-700">Time</span>
                    <input type="datetime-local" className="block w-full mt-1 rounded-md border-gray-300 shadow-sm focus:border-emerald-300 focus:ring focus:ring-emerald-200 focus:ring-opacity-50"
                        {...register("datetime")} />
                    {errors.datetime && <p className="text-red-500">{errors.datetime.message}</p>}
                </label>
                <button className="p-2 px-3 h-fit bg-emerald-600 text-white rounded-lg" type="submit" disabled={addAttendanceRecord.isLoading}>Add</button>
            </div>
            {addAttendanceRecord.isLoading && <p className="text-emerald-600">Loading...</p>}
            {addAttendanceRecord.isSuccess && <p className="text-emerald-600">Success!</p>}
            {addAttendanceRecord.isError && <p className="text-red-500">{addAttendanceRecord.error?.message}</p>}
        </form>
    </div>
}
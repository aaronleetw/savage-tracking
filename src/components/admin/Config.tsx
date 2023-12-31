import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { SubmitHandler, useForm } from "react-hook-form";
import { z } from "zod";
import { api } from "~/utils/api";
import { AddTimePeriodSchema } from "~/utils/types";

export default function Config() {
    const timePeriods = api.admin.getTimePeriods.useQuery();
    const addTimePeriod = api.admin.addTimePeriod.useMutation();
    const deleteTimePeriod = api.admin.deleteTimePeriod.useMutation();

    type AddTimePeriodSchemaType = z.infer<typeof AddTimePeriodSchema>;
    const { register, handleSubmit, formState: { errors } } = useForm<AddTimePeriodSchemaType>({ resolver: zodResolver(AddTimePeriodSchema) });
    const onSubmit: SubmitHandler<AddTimePeriodSchemaType> = async (data, event) => addTimePeriod.mutateAsync(data).then(() => {
        event?.target.reset();
        timePeriods.refetch();
    }).catch((err) => console.log(err));

    return (<div>
        <section>
            <form onSubmit={handleSubmit(onSubmit)}>
                <div>
                    <p className="text-xl font-bold mb-1">Current time periods:</p>
                    <table className="table-auto border-collapse w-fit border-2 border-black">
                        <thead>
                            <tr className="*:p-1 *:border border-b-2 border-b-black">
                                <th>ID</th>
                                <th>Name</th>
                                <th>Start</th>
                                <th>End</th>
                                <th>Operation</th>
                            </tr>
                        </thead>
                        <tbody>
                            {
                                timePeriods.data?.map((period) => (
                                    <tr className="*:p-1 *:border" key={period.id}>
                                        <td>{period.id}</td>
                                        <td>{period.name}</td>
                                        <td>{period.start}</td>
                                        <td>{period.end}</td>
                                        <td className="text-center">
                                            <button className="p-1 px-2 bg-red-600 text-white rounded-lg" onClick={(evt) => {
                                                evt.preventDefault();
                                                deleteTimePeriod.mutateAsync(period.id).then(() => timePeriods.refetch());
                                            }} type="button">Delete</button>
                                        </td>
                                    </tr>
                                ))
                            }
                            <tr className="*:p-1 *:border">
                                <td>
                                    <input type="number" className="mt-1 block w-16 rounded-md border-gray-300 shadow-sm focus:border-emerald-300 focus:ring focus:ring-emerald-200 focus:ring-opacity-70" placeholder="ID" {...register("id")} />
                                </td>
                                <td>
                                    <input type="text" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-300 focus:ring focus:ring-emerald-200 focus:ring-opacity-70" placeholder="Name" {...register("name")} />
                                </td>
                                <td>
                                    <input type="time" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-300 focus:ring focus:ring-emerald-200 focus:ring-opacity-70" placeholder="Start" {...register("startTime")} />
                                </td>
                                <td>
                                    <input type="time" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-300 focus:ring focus:ring-emerald-200 focus:ring-opacity-70" placeholder="End" {...register("endTime")} />
                                </td>
                                <td className="text-center">
                                    <button className="p-1 px-2 bg-emerald-600 text-white rounded-lg" type="submit">Add</button>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                    {errors.id && <p className="text-red-500">{errors.id.message}</p>}
                    {errors.startTime && <p className="text-red-500">{errors.startTime.message}</p>}
                    {errors.endTime && <p className="text-red-500">{errors.endTime.message}</p>}
                    {errors.name && <p className="text-red-500">{errors.name.message}</p>}
                </div>
            </form>
        </section>
        {addTimePeriod.isError && <p className="text-red-500">{addTimePeriod.error.message}</p>}
    </div>)
}
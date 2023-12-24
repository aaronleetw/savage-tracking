import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import { SubmitHandler, useForm } from "react-hook-form";
import { z } from "zod";
import { api } from "~/utils/api";
import { AddPeriods, AddTimePeriodSchema } from "~/utils/types";

export default function Periods() {
    const timePeriods = api.admin.getTimePeriods.useQuery();
    const periods = api.admin.getPeriods.useQuery();
    const addPeriods = api.admin.addPeriods.useMutation();
    const enablePeriod = api.admin.enablePeriod.useMutation();
    const disablePeriod = api.admin.disablePeriod.useMutation();
    type AddPeriodsType = z.infer<typeof AddPeriods>;
    const { register, handleSubmit, formState: { errors } } = useForm<AddPeriodsType>({ resolver: zodResolver(AddPeriods) });
    const onSubmit: SubmitHandler<AddPeriodsType> = async (data, event) => addPeriods.mutateAsync(data).then(() => {
        event?.target.reset();
        periods.refetch();
    }).catch((err) => console.log(err));

    let periodCnt = 0;
    const [periodsDataId, setPeriodsDataId] = useState<number[]>([]);

    useEffect(() => {
        const periodsDataId: number[] = [];
        timePeriods.data?.forEach((timePeriod) => {
            periodsDataId.push(timePeriod.id);
        })
        setPeriodsDataId(periodsDataId);
    }, [timePeriods.data])

    return (<div>
        <table className="table-auto border-collapse border-2 border-black w-fit mb-5">
            <thead>
                <tr className="*:p-1 *:border border-b-2 border-b-black">
                    <th>Date</th>
                    {
                        timePeriods.data?.map((timePeriods) => {
                            return (<th key={timePeriods.id}>{timePeriods.name} ({timePeriods.start} ~ {timePeriods.end})</th>)
                        })
                    }
                </tr>
            </thead>
            <tbody>
                {
                    Object.keys(periods.data || {}).map((date) => {
                        periodCnt = 0;
                        return (
                            <tr className="*:p-1 *:border" key={date}>
                                <td>{date}</td>
                                {
                                    timePeriods.data?.map((timePeriod) => {
                                        const thisPeriodCnt = periodCnt;
                                        if (periods.data![date]![periodCnt]?.timePeriodId == timePeriod.id) {
                                            periodCnt++;
                                            return (<td key={timePeriod.id * periodCnt} className="bg-emerald-600 text-white hover:cursor-pointer"
                                                onClick={() => disablePeriod.mutateAsync({
                                                    date: date,
                                                    timePeriodId: periods.data![date]![thisPeriodCnt]!.timePeriodId
                                                }).then(() => periods.refetch())}>
                                                    Disable
                                                </td>)
                                        } else {
                                            return (<td key={timePeriod.id * periodCnt} className="bg-yellow-600 text-white hover:cursor-pointer" onClick={() => enablePeriod.mutateAsync({
                                                date: date,
                                                timePeriodId: periodsDataId[thisPeriodCnt]!
                                            }).then(() => periods.refetch())}>
                                                Enable
                                            </td>)
                                        }
                                    })
                                }
                            </tr>
                        )
                    })
                }
            </tbody>
        </table>
        <p className="text-red-500 font-bold mb-5">WARNING: Disabling periods will cause records to be deleted as well!</p>
        <hr />
        <h2 className="text-xl font-bold mt-5">Add Date</h2>
        <form onSubmit={handleSubmit(onSubmit)}>
            <div className="flex gap-3">
                <div className="mb-2">
                    <label className="block text-md font-medium text-gray-700 mt-2">Date</label>
                    <input type="text" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-300 focus:ring focus:ring-emerald-200 focus:ring-opacity-70" {...register("date")} />
                    {errors.date && <span className="text-red-500">{errors.date.message}</span>}
                </div>
                <button className="block w-fit h-fit mt-9 bg-emerald-600 px-3 py-2 rounded text-white focus:ring focus:ring-emerald-200 focus:ring-opacity-70 disabled:bg-emerald-400 mb-5" disabled={addPeriods.isLoading}>
                    Create Periods
                </button>
            </div>
            {addPeriods.error && <p className="text-red-500 mb-2">{addPeriods.error.message}</p>}
            {addPeriods.isSuccess && <p className="text-green-500 mb-2">Add periods success!</p>}
        </form>
    </div>)
}
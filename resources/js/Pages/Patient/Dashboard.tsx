import React from "react";
import { Head } from "@inertiajs/react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";

export default function PatientDashboard({ patient, orders = [] }) {
    return (
        <>
            <Head title="Patient Dashboard" />

            <div className="mx-auto max-w-3xl p-6">
                <h1 className="mb-4 text-2xl font-semibold">Patient Dashboard</h1>
                <div className="rounded-lg border bg-white p-5 shadow-sm">
                    <div className="grid gap-4 md:grid-cols-2">
                        <div>
                            <p className="text-xs text-gray-500">Name</p>
                            <p className="font-medium text-gray-900">{patient?.name || "-"}</p>
                        </div>
                        <div>
                            <p className="text-xs text-gray-500">Email</p>
                            <p className="font-medium text-gray-900">{patient?.email || "-"}</p>
                        </div>
                        <div>
                            <p className="text-xs text-gray-500">Phone</p>
                            <p className="font-medium text-gray-900">{patient?.phone || "Not provided"}</p>
                        </div>
                    </div>
                </div>

                <div className="mt-6 rounded-lg border bg-white p-5 shadow-sm">
                    <h2 className="mb-4 text-lg font-semibold text-gray-900">Orders & Results</h2>

                    {orders.length === 0 ? (
                        <p className="text-sm text-gray-500">No orders yet.</p>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200 text-sm">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-3 py-2 text-left font-medium text-gray-600">Order</th>
                                        <th className="px-3 py-2 text-left font-medium text-gray-600">Package</th>
                                        <th className="px-3 py-2 text-left font-medium text-gray-600">Amount</th>
                                        <th className="px-3 py-2 text-left font-medium text-gray-600">Payment</th>
                                        <th className="px-3 py-2 text-left font-medium text-gray-600">Result</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100 bg-white">
                                    {orders.map((order) => (
                                        <tr key={order.id}>
                                            <td className="px-3 py-2 font-medium text-gray-900">{order.order_ref}</td>
                                            <td className="px-3 py-2 text-gray-700">{order.package?.name || "-"}</td>
                                            <td className="px-3 py-2 text-gray-700">
                                                {order.currency} {Number(order.amount || 0).toFixed(2)}
                                            </td>
                                            <td className="px-3 py-2 text-gray-700 capitalize">{order.payment_status}</td>
                                            <td className="px-3 py-2 text-gray-700 capitalize">{order.result?.status || "pending"}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}

PatientDashboard.layout = (page) => <AuthenticatedLayout children={page} />;

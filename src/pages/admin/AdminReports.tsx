
import { useEffect, useState } from 'react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

import {
  IndianRupee,
  ShoppingBag,
  CheckCircle,
  Clock,
  XCircle,
  TrendingUp,
  RefreshCw,
  Download,
} from 'lucide-react';

import {
  getSalesReport,
  type SalesReport,
} from '@/services/api';

import Loader from '@/components/Loader';

export default function Reports() {
  const [report, setReport] =
    useState<SalesReport | null>(null);

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState('');

  const [fromDate, setFromDate] =
    useState('');

  const [toDate, setToDate] =
    useState('');

  // ==========================================
  // DEFAULT DATES
  // ==========================================

  useEffect(() => {
    const today = new Date();

    const firstDay = new Date(
      today.getFullYear(),
      today.getMonth(),
      1
    );

    setFromDate(
      formatInputDate(firstDay)
    );

    setToDate(
      formatInputDate(today)
    );
  }, []);

  // ==========================================
  // LOAD REPORT
  // ==========================================

  async function loadReport(
    start = fromDate,
    end = toDate
  ) {
    if (!start || !end) {
      setError(
        'Please select both dates.'
      );
      return;
    }

    if (start > end) {
      setError(
        'From date cannot be after To date.'
      );
      return;
    }

    try {
      setLoading(true);
      setError('');

      const data =
        await getSalesReport(
          start,
          end
        );

      console.log(
        'REPORT DATA RECEIVED:',
        data
      );

      setReport(data);
    } catch (err) {
      console.error(
        'REPORT ERROR:',
        err
      );

      setError(
        err instanceof Error
          ? err.message
          : 'Failed to load sales report.'
      );
    } finally {
      setLoading(false);
    }
  }

  // ==========================================
  // AUTO LOAD
  // ==========================================

  useEffect(() => {
    if (fromDate && toDate) {
      loadReport(
        fromDate,
        toDate
      );
    }
  }, [fromDate, toDate]);

  // ==========================================
  // QUICK FILTERS
  // ==========================================

  function setToday() {
    const today = new Date();

    const date =
      formatInputDate(today);

    setFromDate(date);
    setToDate(date);
  }

  function setYesterday() {
    const yesterday =
      new Date();

    yesterday.setDate(
      yesterday.getDate() - 1
    );

    const date =
      formatInputDate(
        yesterday
      );

    setFromDate(date);
    setToDate(date);
  }

  function setLast7Days() {
    const today = new Date();

    const start = new Date();

    start.setDate(
      today.getDate() - 6
    );

    setFromDate(
      formatInputDate(start)
    );

    setToDate(
      formatInputDate(today)
    );
  }

  function setThisMonth() {
    const today = new Date();

    const start = new Date(
      today.getFullYear(),
      today.getMonth(),
      1
    );

    setFromDate(
      formatInputDate(start)
    );

    setToDate(
      formatInputDate(today)
    );
  }

  // ==========================================
  // PROFESSIONAL PDF GENERATION
  // ==========================================

  function generatePDF() {
    if (!report) {
      setError(
        'Please generate the report first.'
      );
      return;
    }

    try {
      const doc = new jsPDF();

      const pageWidth =
        doc.internal.pageSize.getWidth();

      const pageHeight =
        doc.internal.pageSize.getHeight();

      // --------------------------------------
      // HEADER
      // --------------------------------------

      doc.setFillColor(
        20,
        83,
        45
      );

      doc.rect(
        0,
        0,
        pageWidth,
        42,
        'F'
      );

      // Company / Brand
      doc.setTextColor(
        255,
        255,
        255
      );

      doc.setFont(
        'helvetica',
        'bold'
      );

      doc.setFontSize(22);

      doc.text(
        'POLLACHI COCONUT OIL',
        14,
        18
      );

      doc.setFont(
        'helvetica',
        'normal'
      );

      doc.setFontSize(9);

      doc.text(
        'Premium Coconut Oil & Natural Products',
        14,
        26
      );

      // Report label
      doc.setFont(
        'helvetica',
        'bold'
      );

      doc.setFontSize(12);

      doc.text(
        'SALES REPORT',
        pageWidth - 14,
        18,
        {
          align: 'right',
        }
      );

      doc.setFont(
        'helvetica',
        'normal'
      );

      doc.setFontSize(9);

      doc.text(
        `Generated: ${formatPDFDate(
          new Date()
        )}`,
        pageWidth - 14,
        26,
        {
          align: 'right',
        }
      );

      // --------------------------------------
      // REPORT PERIOD
      // --------------------------------------

      doc.setTextColor(
        35,
        35,
        35
      );

      doc.setFont(
        'helvetica',
        'bold'
      );

      doc.setFontSize(13);

      doc.text(
        'Report Period',
        14,
        57
      );

      doc.setFont(
        'helvetica',
        'normal'
      );

      doc.setFontSize(10);

      doc.text(
        `${formatDisplayDate(
          report.fromDate
        )}  to  ${formatDisplayDate(
          report.toDate
        )}`,
        14,
        65
      );

      // --------------------------------------
      // SUMMARY BOXES
      // --------------------------------------

      const boxY = 75;

      const boxWidth =
        (pageWidth - 38) / 2;

      const boxHeight = 24;

      const summaryItems = [
        {
          title: 'Total Revenue',
          value: `₹${Number(
            report.totalRevenue
          ).toLocaleString('en-IN')}`,
        },
        {
          title: 'Total Orders',
          value:
            report.totalOrders.toString(),
        },
        {
          title: 'Delivered Orders',
          value:
            report.deliveredOrders.toString(),
        },
        {
          title: 'Pending Orders',
          value:
            report.pendingOrders.toString(),
        },
        {
          title: 'Cancelled Orders',
          value:
            report.cancelledOrders.toString(),
        },
        {
          title: 'Products Sold',
          value:
            report.totalProductsSold.toString(),
        },
        {
          title: 'Customers',
          value:
            report.totalCustomers.toString(),
        },
        {
          title: 'Average Order Value',
          value: `₹${Number(
            report.averageOrderValue
          ).toLocaleString(
            'en-IN',
            {
              maximumFractionDigits: 0,
            }
          )}`,
        },
      ];

      summaryItems.forEach(
        (item, index) => {
          const column =
            index % 2;

          const row =
            Math.floor(index / 2);

          const x =
            14 +
            column *
              (boxWidth + 10);

          const y =
            boxY +
            row *
              (boxHeight + 6);

          doc.setDrawColor(
            220,
            220,
            220
          );

          doc.setFillColor(
            248,
            250,
            248
          );

          doc.roundedRect(
            x,
            y,
            boxWidth,
            boxHeight,
            3,
            3,
            'FD'
          );

          doc.setTextColor(
            100,
            100,
            100
          );

          doc.setFont(
            'helvetica',
            'normal'
          );

          doc.setFontSize(8);

          doc.text(
            item.title,
            x + 6,
            y + 8
          );

          doc.setTextColor(
            25,
            60,
            35
          );

          doc.setFont(
            'helvetica',
            'bold'
          );

          doc.setFontSize(12);

          doc.text(
            item.value,
            x + 6,
            y + 18
          );
        }
      );

      // --------------------------------------
      // DAILY SALES TABLE
      // --------------------------------------

      const tableStartY =
        boxY +
        4 * (boxHeight + 6) +
        12;

      doc.setTextColor(
        35,
        35,
        35
      );

      doc.setFont(
        'helvetica',
        'bold'
      );

      doc.setFontSize(14);

      doc.text(
        'Daily Sales',
        14,
        tableStartY
      );

      doc.setFont(
        'helvetica',
        'normal'
      );

      doc.setFontSize(9);

      doc.setTextColor(
        100,
        100,
        100
      );

      doc.text(
        'Daily order and revenue performance',
        14,
        tableStartY + 7
      );

      const tableData =
        report.dailySales.map(
          (day) => [
            formatDisplayDate(
              day.date
            ),
            day.orders.toString(),
            `₹${Number(
              day.revenue
            ).toLocaleString(
              'en-IN'
            )}`,
          ]
        );

      autoTable(doc, {
        startY:
          tableStartY + 12,

        head: [
          [
            'Date',
            'Orders',
            'Revenue',
          ],
        ],

        body:
          tableData.length > 0
            ? tableData
            : [
                [
                  'No orders',
                  '-',
                  '₹0',
                ],
              ],

        theme: 'grid',

        headStyles: {
          fillColor: [
            20,
            83,
            45,
          ],
          textColor: [
            255,
            255,
            255,
          ],
          fontStyle:
            'bold',
          halign:
            'left',
        },

        bodyStyles: {
          textColor: [
            45,
            45,
            45,
          ],
          fontSize: 9,
        },

        alternateRowStyles: {
          fillColor: [
            248,
            250,
            248,
          ],
        },

        columnStyles: {
          0: {
            cellWidth: 60,
          },
          1: {
            cellWidth: 45,
            halign: 'center',
          },
          2: {
            cellWidth: 65,
            halign: 'right',
          },
        },

        margin: {
          left: 14,
          right: 14,
        },
      });

      // --------------------------------------
      // FOOTER
      // --------------------------------------

      const totalPages =
        doc.getNumberOfPages();

      for (
        let page = 1;
        page <= totalPages;
        page++
      ) {
        doc.setPage(page);

        doc.setDrawColor(
          220,
          220,
          220
        );

        doc.line(
          14,
          pageHeight - 18,
          pageWidth - 14,
          pageHeight - 18
        );

        doc.setTextColor(
          110,
          110,
          110
        );

        doc.setFont(
          'helvetica',
          'normal'
        );

        doc.setFontSize(8);

        doc.text(
          'Pollachi Coconut Oil • Confidential Sales Report',
          14,
          pageHeight - 10
        );

        doc.text(
          `Page ${page} of ${totalPages}`,
          pageWidth - 14,
          pageHeight - 10,
          {
            align: 'right',
          }
        );
      }

      // --------------------------------------
      // DOWNLOAD
      // --------------------------------------

      const fileName =
        `sales-report-${report.fromDate}-to-${report.toDate}.pdf`;

      doc.save(fileName);
    } catch (err) {
      console.error(
        'PDF GENERATION ERROR:',
        err
      );

      setError(
        'Unable to generate PDF report.'
      );
    }
  }

  // ==========================================
  // INITIAL LOADING
  // ==========================================

  if (
    loading &&
    !report
  ) {
    return (
      <Loader
        label="Loading sales report..."
      />
    );
  }

  // ==========================================
  // UI
  // ==========================================

  return (
    <div className="space-y-8">

      {/* HEADER */}

      <div className="flex items-start justify-between gap-4 flex-wrap">

        <div>
          <h1 className="font-heading text-2xl lg:text-3xl text-ink">
            Sales Reports
          </h1>

          <p className="text-sm text-ink-soft mt-1">
            Analyse your store performance
            by date range.
          </p>
        </div>

        {report && (
          <button
            type="button"
            onClick={generatePDF}
            className="btn-primary flex items-center gap-2"
          >
            <Download className="w-4 h-4" />

            Download PDF
          </button>
        )}

      </div>

      {/* DATE FILTER */}

      <div className="card p-5">

        <div className="flex items-center justify-between gap-4 flex-wrap mb-5">

          <div>
            <h2 className="font-heading text-lg text-ink">
              Report Period
            </h2>

            <p className="text-xs text-ink-soft mt-1">
              Select the date range for
              your report.
            </p>
          </div>

          <div className="flex items-center gap-2">

            {report && (
              <button
                type="button"
                onClick={generatePDF}
                className="px-4 py-2 rounded-xl border border-line text-ink text-sm font-medium hover:bg-ink/5 transition-colors flex items-center gap-2"
              >
                <Download className="w-4 h-4" />

                PDF
              </button>
            )}

            <button
              type="button"
              onClick={() =>
                loadReport(
                  fromDate,
                  toDate
                )
              }
              disabled={loading}
              className="btn-primary flex items-center gap-2 disabled:opacity-50"
            >
              <RefreshCw
                className={`w-4 h-4 ${
                  loading
                    ? 'animate-spin'
                    : ''
                }`}
              />

              {loading
                ? 'Loading...'
                : 'Generate Report'}
            </button>

          </div>

        </div>

        {/* QUICK FILTERS */}

        <div className="flex gap-2 flex-wrap mb-5">

          <button
            type="button"
            onClick={setToday}
            className="px-4 py-2 rounded-full bg-ink/5 text-ink-soft text-sm hover:bg-ink/10 transition-colors"
          >
            Today
          </button>

          <button
            type="button"
            onClick={setYesterday}
            className="px-4 py-2 rounded-full bg-ink/5 text-ink-soft text-sm hover:bg-ink/10 transition-colors"
          >
            Yesterday
          </button>

          <button
            type="button"
            onClick={setLast7Days}
            className="px-4 py-2 rounded-full bg-ink/5 text-ink-soft text-sm hover:bg-ink/10 transition-colors"
          >
            Last 7 Days
          </button>

          <button
            type="button"
            onClick={setThisMonth}
            className="px-4 py-2 rounded-full bg-ink/5 text-ink-soft text-sm hover:bg-ink/10 transition-colors"
          >
            This Month
          </button>

        </div>

        {/* CUSTOM DATES */}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

          <div>
            <label className="block text-sm font-medium text-ink mb-2">
              From Date
            </label>

            <input
              type="date"
              value={fromDate}
              onChange={(e) =>
                setFromDate(
                  e.target.value
                )
              }
              className="input-field w-full"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-ink mb-2">
              To Date
            </label>

            <input
              type="date"
              value={toDate}
              onChange={(e) =>
                setToDate(
                  e.target.value
                )
              }
              className="input-field w-full"
            />
          </div>

        </div>

        {/* ERROR */}

        {error && (
          <div className="mt-4 rounded-lg bg-copper/10 px-4 py-3">
            <p className="text-sm text-copper">
              {error}
            </p>
          </div>
        )}

      </div>

      {/* REPORT */}

      {report && (
        <>

          {/* SUMMARY CARDS */}

          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">

            <ReportCard
              title="Total Revenue"
              value={`₹${Number(
                report.totalRevenue
              ).toLocaleString(
                'en-IN'
              )}`}
              icon={IndianRupee}
            />

            <ReportCard
              title="Total Orders"
              value={
                report.totalOrders
              }
              icon={ShoppingBag}
            />

            <ReportCard
              title="Delivered Orders"
              value={
                report.deliveredOrders
              }
              icon={CheckCircle}
            />

            <ReportCard
              title="Pending Orders"
              value={
                report.pendingOrders
              }
              icon={Clock}
            />

          </div>

          {/* SECOND ROW */}

          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">

            <ReportCard
              title="Cancelled Orders"
              value={
                report.cancelledOrders
              }
              icon={XCircle}
            />

            <ReportCard
              title="Products Sold"
              value={
                report.totalProductsSold
              }
              icon={ShoppingBag}
            />

            <ReportCard
              title="Customers"
              value={
                report.totalCustomers
              }
              icon={TrendingUp}
            />

            <ReportCard
              title="Average Order Value"
              value={`₹${Number(
                report.averageOrderValue
              ).toLocaleString(
                'en-IN',
                {
                  maximumFractionDigits: 0,
                }
              )}`}
              icon={IndianRupee}
            />

          </div>

          {/* DAILY SALES */}

          <div className="card overflow-hidden">

            <div className="p-5 border-b border-line flex items-center justify-between gap-4 flex-wrap">

              <div>
                <h2 className="font-heading text-xl text-ink">
                  Daily Sales
                </h2>

                <p className="text-sm text-ink-soft mt-1">
                  Sales performance from{' '}
                  {formatDisplayDate(
                    report.fromDate
                  )}{' '}
                  to{' '}
                  {formatDisplayDate(
                    report.toDate
                  )}
                </p>
              </div>

              <button
                type="button"
                onClick={generatePDF}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-palm text-white text-sm font-medium hover:opacity-90 transition-opacity"
              >
                <Download className="w-4 h-4" />

                Download PDF
              </button>

            </div>

            {report.dailySales.length ===
            0 ? (

              <div className="p-10 text-center text-ink-soft">
                No orders found for
                this date range.
              </div>

            ) : (

              <div className="overflow-x-auto">

                <table className="w-full text-sm">

                  <thead>
                    <tr className="border-b border-line text-left">

                      <th className="p-4 font-medium text-ink">
                        Date
                      </th>

                      <th className="p-4 font-medium text-ink">
                        Orders
                      </th>

                      <th className="p-4 font-medium text-ink">
                        Revenue
                      </th>

                    </tr>
                  </thead>

                  <tbody>

                    {report.dailySales.map(
                      (day) => (

                        <tr
                          key={day.date}
                          className="border-b border-line last:border-0"
                        >

                          <td className="p-4 text-ink">
                            {formatDisplayDate(
                              day.date
                            )}
                          </td>

                          <td className="p-4 text-ink">
                            {day.orders}
                          </td>

                          <td className="p-4 font-medium text-ink">
                            ₹
                            {Number(
                              day.revenue
                            ).toLocaleString(
                              'en-IN'
                            )}
                          </td>

                        </tr>

                      )
                    )}

                  </tbody>

                </table>

              </div>

            )}

          </div>

        </>
      )}

    </div>
  );
}

/* ==========================================
   REPORT CARD
========================================== */

function ReportCard({
  title,
  value,
  icon: Icon,
}: {
  title: string;
  value: string | number;
  icon: any;
}) {
  return (
    <div className="card p-5">

      <div className="flex items-start justify-between">

        <div>

          <p className="text-sm text-ink-soft">
            {title}
          </p>

          <p className="text-2xl font-semibold text-ink mt-2">
            {value}
          </p>

        </div>

        <div className="w-11 h-11 rounded-xl bg-palm/10 flex items-center justify-center">
          <Icon className="w-5 h-5 text-palm" />
        </div>

      </div>

    </div>
  );
}

/* ==========================================
   DATE HELPERS
========================================== */

function formatInputDate(
  date: Date
): string {
  const year =
    date.getFullYear();

  const month =
    String(
      date.getMonth() + 1
    ).padStart(2, '0');

  const day =
    String(
      date.getDate()
    ).padStart(2, '0');

  return `${year}-${month}-${day}`;
}

function formatDisplayDate(
  date: string
): string {
  const parts =
    date.split('-');

  if (parts.length !== 3) {
    return date;
  }

  return `${parts[2]}-${parts[1]}-${parts[0]}`;
}

function formatPDFDate(
  date: Date
): string {
  const day =
    String(
      date.getDate()
    ).padStart(2, '0');

  const month =
    String(
      date.getMonth() + 1
    ).padStart(2, '0');

  const year =
    date.getFullYear();

  return `${day}-${month}-${year}`;
}


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
      setError('Please select both dates.');
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
    const yesterday = new Date();

    yesterday.setDate(
      yesterday.getDate() - 1
    );

    const date =
      formatInputDate(yesterday);

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
  // FINAL PROFESSIONAL PDF
  // ==========================================

  function generatePDF() {
    if (!report) {
      setError(
        'Please generate the report first.'
      );
      return;
    }

    try {
      const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      });

      const pageWidth =
        doc.internal.pageSize.getWidth();

      const pageHeight =
        doc.internal.pageSize.getHeight();

      const margin = 14;

      // ======================================
      // COLORS
      // ======================================

      const GREEN: [number, number, number] = [
        18,
        88,
        48,
      ];

      const DARK_GREEN: [number, number, number] = [
        12,
        67,
        35,
      ];

      const LIGHT_GREEN: [number, number, number] = [
        239,
        247,
        238,
      ];

      const CARD_GREEN: [number, number, number] = [
        248,
        251,
        247,
      ];

      const BORDER: [number, number, number] = [
        211,
        224,
        214,
      ];

      const DARK: [number, number, number] = [
        25,
        43,
        31,
      ];

      const MUTED: [number, number, number] = [
        82,
        102,
        89,
      ];

      const WHITE: [number, number, number] = [
        255,
        255,
        255,
      ];

      // ======================================
      // HELPERS
      // ======================================

      const money = (value: number) =>
        `₹ ${Number(
          value || 0
        ).toLocaleString('en-IN')}`;

      // ======================================
      // TOP HEADER
      // ======================================

      doc.setFillColor(
        255,
        255,
        255
      );

      doc.rect(
        0,
        0,
        pageWidth,
        40,
        'F'
      );

      // --------------------------------------
      // PALM / COCONUT MARK
      // --------------------------------------

      doc.setDrawColor(
        ...GREEN
      );

      doc.setLineWidth(0.8);

      // trunk
      doc.line(
        25,
        28,
        25,
        14
      );

      // leaves
      doc.line(
        25,
        16,
        17,
        11
      );

      doc.line(
        25,
        16,
        33,
        11
      );

      doc.line(
        25,
        18,
        17,
        17
      );

      doc.line(
        25,
        18,
        33,
        17
      );

      doc.line(
        25,
        15,
        22,
        9
      );

      doc.line(
        25,
        15,
        28,
        9
      );

      // coconut
      doc.setFillColor(
        112,
        73,
        37
      );

      doc.circle(
        25,
        29,
        5,
        'F'
      );

      doc.setFillColor(
        255,
        255,
        255
      );

      doc.ellipse(
        25,
        28,
        3.2,
        3.8,
        'F'
      );

      // --------------------------------------
      // BRAND NAME
      // --------------------------------------

      doc.setTextColor(
        ...GREEN
      );

      doc.setFont(
        'helvetica',
        'bold'
      );

      doc.setFontSize(21);

      doc.text(
        'Thennai Manam',
        39,
        18
      );

      // Tamil tagline
      // Note: jsPDF default font may not render
      // Tamil Unicode correctly without a custom
      // Unicode font.
      doc.setFont(
        'helvetica',
        'normal'
      );

      doc.setFontSize(8);

      doc.text(
        'Marathil Aattiya Thooimai',
        40,
        26
      );

      // --------------------------------------
      // RIGHT BRAND TEXT
      // --------------------------------------

      doc.setFont(
        'helvetica',
        'bold'
      );

      doc.setFontSize(8);

      doc.text(
        'Pure • Natural • Traditional',
        pageWidth - margin,
        16,
        {
          align: 'right',
        }
      );

      doc.setFont(
        'helvetica',
        'normal'
      );

      doc.setFontSize(8);

      doc.text(
        'Wood-Pressed Coconut Oil',
        pageWidth - margin,
        23,
        {
          align: 'right',
        }
      );

      // ======================================
      // GREEN HERO BAND
      // ======================================

      doc.setFillColor(
        ...LIGHT_GREEN
      );

      doc.rect(
        0,
        40,
        pageWidth,
        40,
        'F'
      );

      // ======================================
      // REPORT TITLE
      // ======================================

      doc.setTextColor(
        ...DARK_GREEN
      );

      doc.setFont(
        'helvetica',
        'bold'
      );

      doc.setFontSize(25);

      doc.text(
        'Sales Report',
        margin,
        60
      );

      doc.setFont(
        'helvetica',
        'normal'
      );

      doc.setFontSize(9);

      doc.setTextColor(
        ...DARK
      );

      doc.text(
        `Period: ${formatDisplayDate(
          report.fromDate
        )} to ${formatDisplayDate(
          report.toDate
        )}`,
        margin,
        69
      );

      // ======================================
      // GENERATED DATE
      // ======================================

      doc.setFont(
        'helvetica',
        'bold'
      );

      doc.setFontSize(8);

      doc.setTextColor(
        ...GREEN
      );

      doc.text(
        'Generated On',
        pageWidth - margin,
        58,
        {
          align: 'right',
        }
      );

      doc.setFont(
        'helvetica',
        'normal'
      );

      doc.setTextColor(
        ...DARK
      );

      doc.setFontSize(8);

      doc.text(
        formatPDFDateTime(
          new Date()
        ),
        pageWidth - margin,
        66,
        {
          align: 'right',
        }
      );

      // ======================================
      // SUMMARY CARDS
      // ======================================

      const summaryItems = [
        {
          title: 'Total Revenue',
          value: money(
            report.totalRevenue
          ),
          icon: '₹',
        },
        {
          title: 'Total Orders',
          value:
            report.totalOrders.toString(),
          icon: '▣',
        },
        {
          title: 'Delivered Orders',
          value:
            report.deliveredOrders.toString(),
          icon: '✓',
        },
        {
          title: 'Pending Orders',
          value:
            report.pendingOrders.toString(),
          icon: '◷',
        },
        {
          title: 'Cancelled Orders',
          value:
            report.cancelledOrders.toString(),
          icon: '×',
        },
        {
          title: 'Products Sold',
          value:
            report.totalProductsSold.toString(),
          icon: '□',
        },
        {
          title: 'Customers',
          value:
            report.totalCustomers.toString(),
          icon: '●',
        },
        {
          title: 'Average Order Value',
          value: money(
            report.averageOrderValue
          ),
          icon: '₹',
        },
      ];

      const cardGap = 5;

      const cardWidth =
        (pageWidth -
          margin * 2 -
          cardGap * 3) /
        4;

      const cardHeight = 25;

      const cardStartY = 87;

      summaryItems.forEach(
        (item, index) => {
          const column =
            index % 4;

          const row =
            Math.floor(index / 4);

          const x =
            margin +
            column *
              (cardWidth + cardGap);

          const y =
            cardStartY +
            row *
              (cardHeight + cardGap);

          // Card
          doc.setFillColor(
            ...CARD_GREEN
          );

          doc.setDrawColor(
            ...BORDER
          );

          doc.roundedRect(
            x,
            y,
            cardWidth,
            cardHeight,
            3,
            3,
            'FD'
          );

          // Icon circle
          doc.setFillColor(
            ...GREEN
          );

          doc.circle(
            x + 9,
            y + 9,
            4.5,
            'F'
          );

          doc.setTextColor(
            ...WHITE
          );

          doc.setFont(
            'helvetica',
            'bold'
          );

          doc.setFontSize(7);

          doc.text(
            item.icon,
            x + 9,
            y + 11,
            {
              align: 'center',
            }
          );

          // Title
          doc.setTextColor(
            ...MUTED
          );

          doc.setFont(
            'helvetica',
            'normal'
          );

          doc.setFontSize(6.7);

          doc.text(
            item.title,
            x + 17,
            y + 8
          );

          // Value
          doc.setTextColor(
            ...DARK_GREEN
          );

          doc.setFont(
            'helvetica',
            'bold'
          );

          doc.setFontSize(11);

          doc.text(
            item.value,
            x + 17,
            y + 18
          );
        }
      );

      // ======================================
      // DAILY SALES
      // ======================================

      const dailyTitleY =
        148;

      doc.setTextColor(
        ...DARK_GREEN
      );

      doc.setFont(
        'helvetica',
        'bold'
      );

      doc.setFontSize(14);

      doc.text(
        'Daily Sales',
        margin,
        dailyTitleY
      );

      doc.setFont(
        'helvetica',
        'normal'
      );

      doc.setFontSize(8);

      doc.setTextColor(
        ...MUTED
      );

      doc.text(
        'Daily order and revenue performance',
        margin,
        dailyTitleY + 6
      );

      // ======================================
      // DAILY SALES TABLE
      // ======================================

      const dailyRows =
        report.dailySales.map(
          (day) => [
            formatDisplayDate(
              day.date
            ),
            String(day.orders),
            money(day.revenue),
          ]
        );

      autoTable(doc, {
        startY:
          dailyTitleY + 11,

        head: [
          [
            'Date',
            'Orders',
            'Revenue',
          ],
        ],

        body:
          dailyRows.length > 0
            ? dailyRows
            : [
                [
                  'No orders',
                  '-',
                  '₹ 0',
                ],
              ],

        theme: 'grid',

        margin: {
          left: margin,
          right: margin,
        },

        styles: {
          font: 'helvetica',
          fontSize: 8,
          cellPadding: 4,
          lineColor:
            BORDER,
          lineWidth: 0.25,
          textColor:
            DARK,
        },

        headStyles: {
          fillColor:
            GREEN,
          textColor:
            WHITE,
          fontStyle:
            'bold',
          fontSize: 8,
        },

        alternateRowStyles: {
          fillColor:
            CARD_GREEN,
        },

        columnStyles: {
          0: {
            cellWidth: 80,
          },

          1: {
            cellWidth: 55,
            halign: 'center',
          },

          2: {
            cellWidth: 45,
            halign: 'right',
          },
        },
      });

      // ======================================
      // ORDER SUMMARY
      // ======================================

      let orderSummaryY =
        ((doc as any)
          .lastAutoTable
          ?.finalY || 190) + 12;

      if (
        orderSummaryY >
        pageHeight - 55
      ) {
        doc.addPage();

        orderSummaryY = 25;
      }

      doc.setTextColor(
        ...DARK_GREEN
      );

      doc.setFont(
        'helvetica',
        'bold'
      );

      doc.setFontSize(14);

      doc.text(
        'Order Summary',
        margin,
        orderSummaryY
      );

      doc.setFont(
        'helvetica',
        'normal'
      );

      doc.setFontSize(8);

      doc.setTextColor(
        ...MUTED
      );

      doc.text(
        'Order summary for the selected report period',
        margin,
        orderSummaryY + 6
      );

      /*
       * Current SalesReport does not expose
       * individual order number/customer/status
       * rows to this component.
       *
       * Therefore we display the real report
       * totals instead of creating fake orders.
       */

      autoTable(doc, {
        startY:
          orderSummaryY + 11,

        head: [
          [
            '#',
            'Report Period',
            'Orders',
            'Revenue',
          ],
        ],

        body: [
          [
            '1',
            `${formatDisplayDate(
              report.fromDate
            )} - ${formatDisplayDate(
              report.toDate
            )}`,
            String(
              report.totalOrders
            ),
            money(
              report.totalRevenue
            ),
          ],
        ],

        theme: 'grid',

        margin: {
          left: margin,
          right: margin,
        },

        styles: {
          font: 'helvetica',
          fontSize: 7.5,
          cellPadding: 3.5,
          lineColor:
            BORDER,
          lineWidth: 0.25,
          textColor:
            DARK,
        },

        headStyles: {
          fillColor:
            GREEN,
          textColor:
            WHITE,
          fontStyle:
            'bold',
          fontSize: 7.5,
        },

        alternateRowStyles: {
          fillColor:
            CARD_GREEN,
        },

        columnStyles: {
          0: {
            cellWidth: 12,
            halign: 'center',
          },

          1: {
            cellWidth: 85,
          },

          2: {
            cellWidth: 35,
            halign: 'center',
          },

          3: {
            cellWidth: 48,
            halign: 'right',
          },
        },
      });

      // ======================================
      // THANK YOU SECTION
      // ======================================

      const footerTop =
        pageHeight - 38;

      doc.setFillColor(
        ...LIGHT_GREEN
      );

      doc.rect(
        0,
        footerTop,
        pageWidth,
        38,
        'F'
      );

      // Thank you
      doc.setTextColor(
        ...DARK_GREEN
      );

      doc.setFont(
        'helvetica',
        'bolditalic'
      );

      doc.setFontSize(17);

      doc.text(
        'Thank you',
        18,
        footerTop + 13
      );

      doc.setFont(
        'helvetica',
        'italic'
      );

      doc.setFontSize(8);

      doc.text(
        'for supporting Thennai Manam!',
        18,
        footerTop + 21
      );

      // ======================================
      // FEATURE 1
      // ======================================

      doc.setTextColor(
        ...DARK_GREEN
      );

      doc.setFont(
        'helvetica',
        'bold'
      );

      doc.setFontSize(7);

      doc.text(
        '100%',
        91,
        footerTop + 13,
        {
          align: 'center',
        }
      );

      doc.setFont(
        'helvetica',
        'normal'
      );

      doc.text(
        'Natural',
        91,
        footerTop + 20,
        {
          align: 'center',
        }
      );

      // Divider
      doc.setDrawColor(
        ...BORDER
      );

      doc.line(
        110,
        footerTop + 7,
        110,
        footerTop + 27
      );

      // ======================================
      // FEATURE 2
      // ======================================

      doc.setFont(
        'helvetica',
        'bold'
      );

      doc.text(
        'NO',
        130,
        footerTop + 13,
        {
          align: 'center',
        }
      );

      doc.setFont(
        'helvetica',
        'normal'
      );

      doc.text(
        'Chemicals',
        130,
        footerTop + 20,
        {
          align: 'center',
        }
      );

      // Divider
      doc.line(
        150,
        footerTop + 7,
        150,
        footerTop + 27
      );

      // ======================================
      // FEATURE 3
      // ======================================

      doc.setFont(
        'helvetica',
        'bold'
      );

      doc.text(
        'PURE',
        172,
        footerTop + 13,
        {
          align: 'center',
        }
      );

      doc.setFont(
        'helvetica',
        'normal'
      );

      doc.text(
        'From Pollachi',
        172,
        footerTop + 20,
        {
          align: 'center',
        }
      );

      // ======================================
      // BOTTOM GREEN FOOTER
      // ======================================

      doc.setFillColor(
        ...GREEN
      );

      doc.rect(
        0,
        pageHeight - 8,
        pageWidth,
        8,
        'F'
      );

      doc.setTextColor(
        ...WHITE
      );

      doc.setFont(
        'helvetica',
        'normal'
      );

      doc.setFontSize(6.5);

      doc.text(
        'Thennai Manam • Pure • Natural • Traditional',
        margin,
        pageHeight - 3
      );

      doc.text(
        `Page ${doc.getNumberOfPages()}`,
        pageWidth - margin,
        pageHeight - 3,
        {
          align: 'right',
        }
      );

      // ======================================
      // SAVE
      // ======================================

      const fileName =
        `thennai-manam-sales-report-${report.fromDate}-to-${report.toDate}.pdf`;

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

function formatPDFDateTime(
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

  let hours =
    date.getHours();

  const minutes =
    String(
      date.getMinutes()
    ).padStart(2, '0');

  const period =
    hours >= 12
      ? 'PM'
      : 'AM';

  hours =
    hours % 12 || 12;

  return `${day}-${month}-${year} ${hours}:${minutes} ${period}`;
}

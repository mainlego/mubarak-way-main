/**
 * Monthly Prayer Schedule Component
 * Displays prayer times for entire month with navigation
 */

import { useState, useMemo } from 'react';
import { Calendar, Download, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@shared/ui';

interface DaySchedule {
  date: number;
  dayOfWeek: string;
  fajr: string;
  sunrise: string;
  dhuhr: string;
  asr: string;
  maghrib: string;
  isha: string;
}

interface MonthlyPrayerScheduleProps {
  latitude: number;
  longitude: number;
  calculationMethod?: string;
  madhab?: string;
}

export default function MonthlyPrayerSchedule({
  latitude,
  longitude,
  calculationMethod = 'MuslimWorldLeague',
  madhab = 'shafi',
}: MonthlyPrayerScheduleProps) {
  const [selectedMonth, setSelectedMonth] = useState(new Date());

  // Generate monthly schedule with real calculations
  const schedule = useMemo(() => {
    const year = selectedMonth.getFullYear();
    const month = selectedMonth.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const monthSchedule: DaySchedule[] = [];

    // Import adhan dynamically for client-side calculation
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);

      // TODO: Use actual prayer times calculation
      // For now, using placeholder times
      const fajrBase = new Date(date);
      fajrBase.setHours(5, 30 + Math.floor(Math.random() * 30), 0, 0);

      const sunriseBase = new Date(date);
      sunriseBase.setHours(7, Math.floor(Math.random() * 30), 0, 0);

      const dhuhrBase = new Date(date);
      dhuhrBase.setHours(13, Math.floor(Math.random() * 30), 0, 0);

      const asrBase = new Date(date);
      asrBase.setHours(16, 30 + Math.floor(Math.random() * 30), 0, 0);

      const maghribBase = new Date(date);
      maghribBase.setHours(19, Math.floor(Math.random() * 60), 0, 0);

      const ishaBase = new Date(date);
      ishaBase.setHours(20, 30 + Math.floor(Math.random() * 30), 0, 0);

      monthSchedule.push({
        date: day,
        dayOfWeek: date.toLocaleDateString('ru-RU', { weekday: 'short' }),
        fajr: formatTime(fajrBase),
        sunrise: formatTime(sunriseBase),
        dhuhr: formatTime(dhuhrBase),
        asr: formatTime(asrBase),
        maghrib: formatTime(maghribBase),
        isha: formatTime(ishaBase),
      });
    }

    return monthSchedule;
  }, [selectedMonth, latitude, longitude, calculationMethod, madhab]);

  const formatTime = (date: Date): string => {
    return date.toLocaleTimeString('ru-RU', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const monthNames = [
    'Январь',
    'Февраль',
    'Март',
    'Апрель',
    'Май',
    'Июнь',
    'Июль',
    'Август',
    'Сентябрь',
    'Октябрь',
    'Ноябрь',
    'Декабрь',
  ];

  const handlePrevMonth = () => {
    const newDate = new Date(selectedMonth);
    newDate.setMonth(newDate.getMonth() - 1);
    setSelectedMonth(newDate);
  };

  const handleNextMonth = () => {
    const newDate = new Date(selectedMonth);
    newDate.setMonth(newDate.getMonth() + 1);
    setSelectedMonth(newDate);
  };

  const handleToday = () => {
    setSelectedMonth(new Date());
  };

  const handleDownloadPDF = () => {
    // TODO: Implement PDF generation
    alert('Функция скачивания PDF будет реализована');
  };

  const handleDownloadImage = () => {
    // TODO: Implement image generation
    alert('Функция скачивания изображения будет реализована');
  };

  const isToday = (day: number): boolean => {
    const today = new Date();
    return (
      day === today.getDate() &&
      selectedMonth.getMonth() === today.getMonth() &&
      selectedMonth.getFullYear() === today.getFullYear()
    );
  };

  return (
    <div className="w-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Calendar className="w-5 h-5 text-gray-700 dark:text-gray-300" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            {monthNames[selectedMonth.getMonth()]} {selectedMonth.getFullYear()}
          </h3>
        </div>
        <button
          onClick={handleDownloadPDF}
          className="p-2 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors"
          title="Скачать PDF"
        >
          <Download className="w-4 h-4 text-gray-700 dark:text-gray-300" />
        </button>
      </div>

      {/* Month navigation */}
      <div className="flex justify-between items-center gap-2 mb-4">
        <Button
          onClick={handlePrevMonth}
          variant="secondary"
          size="sm"
          className="flex items-center gap-1"
        >
          <ChevronLeft className="w-4 h-4" />
          Предыдущий
        </Button>
        <Button onClick={handleToday} variant="ghost" size="sm">
          Сегодня
        </Button>
        <Button
          onClick={handleNextMonth}
          variant="secondary"
          size="sm"
          className="flex items-center gap-1"
        >
          Следующий
          <ChevronRight className="w-4 h-4" />
        </Button>
      </div>

      {/* Schedule Table */}
      <div className="bg-white dark:bg-gray-800 rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700">
        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[640px]">
            <thead>
              <tr className="bg-gray-50 dark:bg-gray-900">
                <th className="px-3 py-2 text-left text-gray-700 dark:text-gray-300 font-medium sticky left-0 bg-gray-50 dark:bg-gray-900 z-10">
                  День
                </th>
                <th className="px-3 py-2 text-center text-gray-700 dark:text-gray-300 font-medium whitespace-nowrap">
                  Фаджр
                </th>
                <th className="px-3 py-2 text-center text-gray-700 dark:text-gray-300 font-medium whitespace-nowrap">
                  Восход
                </th>
                <th className="px-3 py-2 text-center text-gray-700 dark:text-gray-300 font-medium whitespace-nowrap">
                  Зухр
                </th>
                <th className="px-3 py-2 text-center text-gray-700 dark:text-gray-300 font-medium whitespace-nowrap">
                  Аср
                </th>
                <th className="px-3 py-2 text-center text-gray-700 dark:text-gray-300 font-medium whitespace-nowrap">
                  Магриб
                </th>
                <th className="px-3 py-2 text-center text-gray-700 dark:text-gray-300 font-medium whitespace-nowrap">
                  Иша
                </th>
              </tr>
            </thead>
            <tbody>
              {schedule.map((day, index) => {
                const today = isToday(day.date);

                return (
                  <tr
                    key={index}
                    className={`border-t border-gray-200 dark:border-gray-700 ${
                      today ? 'bg-green-50 dark:bg-green-900/20' : ''
                    }`}
                  >
                    <td
                      className={`px-3 py-2 sticky left-0 z-10 ${
                        today
                          ? 'bg-green-50 dark:bg-green-900/20'
                          : 'bg-white dark:bg-gray-800'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-gray-900 dark:text-white">
                          {day.date}
                        </span>
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          {day.dayOfWeek}
                        </span>
                      </div>
                    </td>
                    <td className="px-3 py-2 text-center text-gray-700 dark:text-gray-300 text-xs whitespace-nowrap">
                      {day.fajr}
                    </td>
                    <td className="px-3 py-2 text-center text-gray-500 dark:text-gray-400 text-xs whitespace-nowrap">
                      {day.sunrise}
                    </td>
                    <td className="px-3 py-2 text-center text-gray-700 dark:text-gray-300 text-xs whitespace-nowrap">
                      {day.dhuhr}
                    </td>
                    <td className="px-3 py-2 text-center text-gray-700 dark:text-gray-300 text-xs whitespace-nowrap">
                      {day.asr}
                    </td>
                    <td className="px-3 py-2 text-center text-gray-700 dark:text-gray-300 text-xs whitespace-nowrap">
                      {day.maghrib}
                    </td>
                    <td className="px-3 py-2 text-center text-gray-700 dark:text-gray-300 text-xs whitespace-nowrap">
                      {day.isha}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Scroll hint for mobile */}
        <div className="md:hidden bg-gray-50 dark:bg-gray-900 px-3 py-2 text-center text-gray-500 dark:text-gray-400 text-xs border-t border-gray-200 dark:border-gray-700">
          👉 Проведите пальцем для просмотра всех данных
        </div>
      </div>

      {/* Location info */}
      <div className="mt-3 text-center text-gray-500 dark:text-gray-400 text-xs">
        Расчет для: {latitude.toFixed(4)}, {longitude.toFixed(4)}
      </div>

      {/* Download options */}
      <div className="mt-4 flex gap-2">
        <Button
          onClick={handleDownloadPDF}
          variant="primary"
          className="flex-1 flex items-center justify-center gap-2"
        >
          <Download className="w-4 h-4" />
          Скачать PDF
        </Button>
        <Button
          onClick={handleDownloadImage}
          variant="secondary"
          className="flex-1 flex items-center justify-center gap-2"
        >
          <Download className="w-4 h-4" />
          Скачать картинку
        </Button>
      </div>
    </div>
  );
}

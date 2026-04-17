"use client"

import {
  Select,
  SelectContent,
  SelectItemPeriod,
  SelectTrigger,
  SelectValue,
} from "@/components/tremor/Select"

import { Label } from "@/components/tremor/Label"

import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/tremor/Dialog"

import { PeriodValue } from "@/lib/types/overview-types"
import type { OverviewData } from "@/lib/types/table-schema"
import { Button } from "@/components/tremor/Button"
import { Checkbox } from "@/components/tremor/Checkbox"
import { DateRangePicker } from "@/components/tremor/DatePicker"
import { cx } from "@/lib/utils"
import { RiSettings5Line } from "@remixicon/react"
import { eachDayOfInterval, interval, subDays, subYears } from "date-fns"
import React from "react"
import { DateRange } from "react-day-picker"
import { APP } from "@/content/app"
import { ChartCard } from "./DashboardChartCard"

type Period = {
  value: PeriodValue
  label: string
}

const periods: Period[] = [
  {
    value: "previous-period",
    label: "Previous period",
  },
  {
    value: "last-year",
    label: "Last year",
  },
  {
    value: "no-comparison",
    label: "No comparison",
  },
]

export const getPeriod = (
  dateRange: DateRange | undefined,
  value: PeriodValue,
): DateRange | undefined => {
  if (!dateRange) return undefined
  const from = dateRange.from
  const to = dateRange.to
  switch (value) {
    case "previous-period":
      let previousPeriodFrom
      let previousPeriodTo
      if (from && to) {
        const datesInterval = interval(from, to)
        const numberOfDaysBetween = eachDayOfInterval(datesInterval).length
        previousPeriodTo = subDays(from, 1)
        previousPeriodFrom = subDays(previousPeriodTo, numberOfDaysBetween)
      }
      return { from: previousPeriodFrom, to: previousPeriodTo }
    case "last-year":
      let lastYearFrom
      let lastYearTo
      if (from) {
        lastYearFrom = subYears(from, 1)
      }
      if (to) {
        lastYearTo = subYears(to, 1)
      }
      return { from: lastYearFrom, to: lastYearTo }
    case "no-comparison":
      return undefined
  }
}

interface CategoryOption {
  title: keyof OverviewData
  type: "currency" | "unit"
}

type FilterbarProps = {
  maxDate?: Date
  minDate?: Date
  selectedDates: DateRange | undefined
  onDatesChange: (dates: DateRange | undefined) => void
  selectedPeriod: PeriodValue
  onPeriodChange: (period: PeriodValue) => void
  categories: CategoryOption[]
  setSelectedCategories: (categories: string[]) => void
  selectedCategories: string[]
}

export function Filterbar({
  maxDate,
  minDate,
  selectedDates,
  onDatesChange,
  selectedPeriod,
  onPeriodChange,
  categories,
  setSelectedCategories,
  selectedCategories,
}: FilterbarProps) {
  const [tempSelectedCategories, setTempSelectedCategories] =
    React.useState(selectedCategories)

  const handleCategoryChange = (category: string) => {
    setTempSelectedCategories((prev: string[]) =>
      prev.includes(category)
        ? prev.filter((item: string) => item !== category)
        : [...prev, category],
    )
  }

  const handleApply = () => {
    setSelectedCategories(tempSelectedCategories)
  }
  return (
    <div className="flex w-full justify-between">
      <div className="w-full sm:flex sm:items-center sm:gap-2">
        <DateRangePicker
          value={selectedDates}
          onChange={onDatesChange}
          className="w-full sm:w-fit"
          toDate={maxDate}
          fromDate={minDate}
          align="start"
        />
        <span className="hidden text-sm font-medium text-gray-500 sm:block">
          {APP.DASHBOARD_UI.comparedTo}
        </span>
        <Select
          defaultValue="no-comparison"
          value={selectedPeriod}
          onValueChange={(value) => {
            onPeriodChange(value as PeriodValue)
          }}
        >
          <SelectTrigger className="mt-2 w-full sm:mt-0 sm:w-fit">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {periods.map((period) => (
              <SelectItemPeriod
                key={period.value}
                value={period.value}
                period={getPeriod(selectedDates, period.value)}
              >
                {period.label}
              </SelectItemPeriod>
            ))}
          </SelectContent>
        </Select>
      </div>
      <Dialog>
        <DialogTrigger asChild>
          <Button
            variant="secondary"
            className="hidden gap-2 px-3 py-2.5 min-h-[44px] sm:flex"
          >
            <RiSettings5Line
              className="-ml-0.5 size-4 shrink-0"
              aria-hidden="true"
            />
            <span>{APP.DASHBOARD_UI.edit}</span>
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-5xl">
          <DialogHeader>
            <DialogTitle>{APP.DASHBOARD_UI.customiseCharts}</DialogTitle>
            <DialogDescription className="sr-only">
              {APP.DASHBOARD_UI.customiseChartsDescription}
            </DialogDescription>
          </DialogHeader>
          <div
            className={cx(
              "mt-8 grid max-h-[70vh] grid-cols-1 gap-4 overflow-y-scroll sm:grid-cols-1 md:grid-cols-2 xl:grid-cols-3",
            )}
          >
            {categories.map((category) => {
              return (
                <Label
                  htmlFor={category.title}
                  key={category.title}
                  className="relative cursor-pointer rounded-md border border-gray-200 p-4 shadow-sm dark:border-gray-800"
                >
                  <Checkbox
                    id={category.title}
                    className="absolute right-4"
                    checked={tempSelectedCategories.includes(category.title)}
                    onCheckedChange={() => handleCategoryChange(category.title)}
                  />
                  <div className="pointer-events-none">
                    <ChartCard
                      title={category.title}
                      type={category.type}
                      selectedDates={selectedDates}
                      selectedPeriod={selectedPeriod}
                      isThumbnail={true}
                    />
                  </div>
                </Label>
              )
            })}
          </div>
          <DialogFooter className="mt-6">
            <DialogClose asChild>
              <Button
                className="mt-2 w-full sm:mt-0 sm:w-fit"
                variant="secondary"
              >
                {APP.DASHBOARD_UI.cancel}
              </Button>
            </DialogClose>
            <DialogClose asChild>
              <Button className="w-full sm:w-fit" onClick={handleApply}>
                {APP.DASHBOARD_UI.apply}
              </Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

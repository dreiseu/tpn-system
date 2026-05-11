import { ChevronLeftIcon, ChevronRightIcon } from 'lucide-react';
import * as React from 'react';
import { DayPicker, type DayPickerProps } from 'react-day-picker';
import { buttonVariants } from '@/components/ui/button';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';

type CalendarDropdownProps = React.SelectHTMLAttributes<HTMLSelectElement> & {
    options?: Array<{
        value: number;
        label: string;
        disabled: boolean;
    }>;
};

function Calendar({
    className,
    classNames,
    showOutsideDays = true,
    ...props
}: DayPickerProps) {
    const usesDropdownCaption = props.captionLayout?.startsWith('dropdown') ?? false;

    return (
        <DayPicker
            showOutsideDays={showOutsideDays}
            className={cn('p-3', className)}
            classNames={{
                months: 'flex flex-col gap-4',
                month: 'flex flex-col gap-4',
                nav: usesDropdownCaption ? 'hidden' : 'flex items-center gap-1',
                button_previous: cn(
                    buttonVariants({ variant: 'outline', size: 'icon' }),
                    'size-7 bg-transparent p-0 opacity-80 hover:opacity-100',
                ),
                button_next: cn(
                    buttonVariants({ variant: 'outline', size: 'icon' }),
                    'size-7 bg-transparent p-0 opacity-80 hover:opacity-100',
                ),
                month_caption: 'flex h-9 items-center justify-center',
                dropdowns: 'flex h-9 items-center justify-center gap-2',
                dropdown_root: 'relative inline-flex h-9 items-center',
                dropdown: 'h-9',
                months_dropdown: 'min-w-36',
                years_dropdown: 'min-w-28',
                chevron: 'ml-1 size-4 text-muted-foreground',
                weekdays: 'flex',
                weekday: 'text-muted-foreground w-9 text-[0.8rem] font-normal',
                week: 'mt-2 flex w-full',
                day: 'size-9 p-0 text-center text-sm aria-selected:opacity-100',
                day_button: cn(
                    buttonVariants({ variant: 'ghost' }),
                    'size-9 p-0 font-normal cursor-pointer',
                ),
                selected:
                    '[&_button]:bg-primary [&_button]:text-primary-foreground [&_button:hover]:bg-primary [&_button:hover]:text-primary-foreground [&_button:focus]:bg-primary [&_button:focus]:text-primary-foreground',
                today: '[&_button]:bg-accent [&_button]:text-accent-foreground',
                outside: 'text-muted-foreground opacity-50',
                disabled: 'text-muted-foreground opacity-50',
                hidden: 'invisible',
                ...classNames,
            }}
            components={{
                Dropdown: CalendarDropdown,
                Chevron: ({ orientation, className, ...iconProps }) =>
                    orientation === 'left' ? (
                        <ChevronLeftIcon className={cn('size-4', className)} {...iconProps} />
                    ) : (
                        <ChevronRightIcon className={cn('size-4', className)} {...iconProps} />
                    ),
            }}
            {...props}
        />
    );
}

function CalendarDropdown({
    className,
    value,
    onChange,
    options,
    disabled,
    'aria-label': ariaLabel,
}: CalendarDropdownProps) {
    return (
        <Select
            value={value === undefined ? undefined : String(value)}
            disabled={disabled}
            onValueChange={(nextValue) => {
                onChange?.({
                    target: { value: nextValue },
                } as React.ChangeEvent<HTMLSelectElement>);
            }}
        >
            <SelectTrigger aria-label={ariaLabel} className={cn('h-9 bg-background cursor-pointer', className)}>
                <SelectValue />
            </SelectTrigger>
            <SelectContent className="z-[70] max-h-72">
                {options?.map((option) => (
                    <SelectItem
                        key={option.value}
                        value={String(option.value)}
                        className='cursor-pointer'
                        disabled={option.disabled}
                    >
                        {option.label}
                    </SelectItem>
                ))}
            </SelectContent>
        </Select>
    );
}

export { Calendar };

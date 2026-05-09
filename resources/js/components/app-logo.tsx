import AppLogoIcon from '@/components/app-logo-icon';

export default function AppLogo() {
    return (
        <>
            <div className="flex size-11 items-center justify-center overflow-hidden rounded-full border border-white/50 bg-white shadow-sm">
                <AppLogoIcon className="size-10 object-contain" />
            </div>
            <div className="ml-2 grid flex-1 text-left leading-tight text-sidebar-foreground transition-opacity group-data-[collapsible=icon]:pointer-events-none group-data-[collapsible=icon]:w-0 group-data-[collapsible=icon]:opacity-0">
                <span className="truncate text-[0.72rem] font-semibold uppercase tracking-[0.18em] text-white/70">
                    BGHMC
                </span>
                <span className="truncate text-base font-bold text-white">
                    Total Parenteral Nutrition System
                </span>
            </div>
        </>
    );
}

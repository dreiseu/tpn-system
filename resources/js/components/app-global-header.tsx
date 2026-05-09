import AppLogoIcon from '@/components/app-logo-icon';
import { NavUser } from '@/components/nav-user';

export function AppGlobalHeader() {
    return (
        <header className="emr-global-header relative flex h-[90px] shrink-0 items-stretch overflow-hidden border-b border-neutral-800 text-white">
            <div className="main-system-header">
                <div className="main-system-left">
                    <div className="main-system-panel">
                        <div className="main-system-left-content">
                            <AppLogoIcon className="main-system-logo" />

                            <div className="main-system-title">
                                <div className="main-system-title-line">
                                    Total Parenteral
                                </div>
                                <div className="info-system">
                                    <span className="main-system-title-line">
                                        Nutrition System
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="main-system-stripes">
                        <div className="main-system-stripes1">
                            <span></span>
                        </div>
                        <div className="main-system-stripes2">
                            <span></span>
                        </div>
                    </div>
                </div>

                <div className="main-system-right flex items-center justify-end px-5">
                    <NavUser variant="global" />
                </div>
            </div>
        </header>
    );
}

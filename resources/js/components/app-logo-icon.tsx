import type { ImgHTMLAttributes } from 'react';
import bghmcLogo from '@/../images/BGHMC_Logo_Compressed.png';

export default function AppLogoIcon(props: ImgHTMLAttributes<HTMLImageElement>) {
    return (
        <img
            {...props}
            src={bghmcLogo}
            alt="BGHMC logo"
        />
    );
}

import type { ImgHTMLAttributes } from 'react';
import bghmcLogo from '@/../images/BGHMC logo hi-res.png';

export default function AppLogoIcon(props: ImgHTMLAttributes<HTMLImageElement>) {
    return (
        <img
            {...props}
            src={bghmcLogo}
            alt="BGHMC logo"
        />
    );
}

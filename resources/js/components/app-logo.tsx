import AppLogoIcon from './app-logo-icon';
import { usePage } from '@inertiajs/react';
import { SharedData } from '@/types';

export default function AppLogo() {
    const { name } = usePage<SharedData>().props;
    return (
        <>
            <div className="flex items-center justify-center rounded-md gap-1">
                <img alt="LionzHost" className="h-8 w-auto" src="/images/logo_big.png" />
                <span className="truncate leading-tight font-semibold text-lg">
                    {/* App Name */}
                    {name}
                </span>
            </div>
        </>
    );
}

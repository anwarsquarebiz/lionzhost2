import { SVGAttributes } from 'react';


export default function AppLogoIcon(props: SVGAttributes<SVGElement>) {
    return (
        <div className="flex items-center gap-2"><img alt="LionzHost" className="h-8 w-auto" src="/images/logo_big.png" /><span className="text-xl font-bold">LionzHost</span></div>
    );
}

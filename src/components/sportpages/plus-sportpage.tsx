
export interface PlusSportpageProps {
    fullName: string;
    dateOfBirth: string;
    sport: string;
    isAmateur: boolean;
    details: string;
    achievements: string;
}

export function PlusSportpage({ fullName, dateOfBirth, sport, isAmateur, details, achievements }: PlusSportpageProps) {

    const detailItems = details.split(',').map(item => item.trim());
    const achievementItems = achievements.split(',').map(item => item.trim());

    return (
        <html lang="en">
        <head>
            <meta charSet="UTF-8" />
            <meta name="viewport" content="width=device-width, initial-scale=1.0" />
            <title>{fullName} - Sport Page</title>
            <script src="https://cdn.tailwindcss.com"></script>
        </head>
        <body className="bg-gray-900 text-white font-sans">
            <div className="container mx-auto p-4 md:p-8">
                <div className="bg-gray-800 shadow-2xl rounded-2xl overflow-hidden">
                    <div className="p-8 md:p-12">
                        <div className="flex flex-col md:flex-row items-center gap-8">
                            <div className="w-48 h-48 md:w-64 md:h-64 flex-shrink-0">
                                <img
                                    src="__IMAGE_PLACEHOLDER__"
                                    alt={fullName}
                                    className="w-full h-full rounded-full object-cover border-4 border-cyan-400 shadow-lg"
                                />
                            </div>
                            <div className="text-center md:text-left">
                                <h1 className="text-5xl md:text-7xl font-bold tracking-tight uppercase">{fullName}</h1>
                                <p className="text-2xl text-cyan-400 font-semibold mt-2">{sport}</p>
                                <div className="mt-4 flex justify-center md:justify-start gap-4">
                                    <span className="bg-cyan-500/20 text-cyan-300 text-xs font-bold mr-2 px-3 py-1.5 rounded-full">{isAmateur ? 'Amateur' : 'Professional'}</span>
                                    <span className="bg-gray-700 text-gray-300 text-xs font-bold px-3 py-1.5 rounded-full">Born: {dateOfBirth}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-gray-800/50 p-8 md:p-12 grid grid-cols-1 md:grid-cols-2 gap-12">
                        <div>
                            <h2 className="text-3xl font-bold text-cyan-400 border-b-2 border-cyan-400/30 pb-2 mb-6">Details</h2>
                            <ul className="space-y-4">
                                {detailItems.map((item, index) => (
                                    <li key={index} className="flex items-center gap-3">
                                        <svg className="w-5 h-5 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                                        <span className="text-lg text-gray-300">{item}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                        <div>
                            <h2 className="text-3xl font-bold text-cyan-400 border-b-2 border-cyan-400/30 pb-2 mb-6">Achievements</h2>
                            <ul className="space-y-4">
                                {achievementItems.map((item, index) => (
                                    <li key={index} className="flex items-center gap-3">
                                        <svg className="w-5 h-5 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                                        <span className="text-lg text-gray-300">{item}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </body>
        </html>
    );
}

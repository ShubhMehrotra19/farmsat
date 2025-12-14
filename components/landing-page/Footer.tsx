export function Footer() {
    return (
        <footer className="bg-white border-t border-gray-100 pt-16 pb-8">
            <div className="container mx-auto px-4">
                <div className="flex flex-col md:flex-row justify-between items-center">
                    <div className="mb-4 md:mb-0">
                        <span className="text-2xl font-bold text-emerald-800 notranslate">KisanMitr</span>
                        <p className="text-sm text-gray-500 mt-2">Empowering farmers with satellite intelligence.</p>
                    </div>

                    <div className="flex gap-8 text-sm text-gray-600">
                        <a href="#" className="hover:text-emerald-600 transition-colors">Privacy</a>
                        <a href="#" className="hover:text-emerald-600 transition-colors">Terms</a>
                        <a href="#" className="hover:text-emerald-600 transition-colors">Contact</a>
                    </div>
                </div>

                <div className="mt-8 pt-8 border-t border-gray-100 text-center text-xs text-gray-400">
                    © {new Date().getFullYear()} <span className="notranslate">KisanMitr</span>. All rights reserved.
                </div>
            </div>
        </footer>
    )
}

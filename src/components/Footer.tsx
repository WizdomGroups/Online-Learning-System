import React from "react";
import { Link } from "react-router-dom";
import { MapPin, Phone, Mail, Linkedin, Twitter, Instagram } from "lucide-react";
import useLocalStorage from "../lib/hooks/useLocalStorageUserData";

const Footer = () => {
    const currentYear = new Date().getFullYear();
    const {
        isAdmin,
        isSuperAdmin,
        isHR,
        isTrainer,
        employeeId,
        isManager,
    } = useLocalStorage();

    // Determine user role prefix for routes
    const getRolePrefix = () => {
        if (isSuperAdmin) return "/super-admin";
        if (isAdmin) return "/admin";
        if (isManager) return "/manager";
        if (isHR) return "/hr";
        if (isTrainer) return "/trainer";
        return "/employee";
    };

    const rolePrefix = getRolePrefix();
    const isEmployee = employeeId && !isAdmin && !isTrainer && !isHR && !isManager && !isSuperAdmin;

    return (
        <footer className="bg-[#0a4d5c] text-white border-t-2 border-[#083d4a]">
            <div className="max-w-7xl mx-auto px-4 md:px-8 py-10">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-10">

                    {/* Company Info */}
                    <div className="space-y-4">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-12 h-12 bg-teal-500 rounded-lg flex items-center justify-center text-white font-bold text-xl">
                                W
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-white">Wizdom Group</h3>
                                <p className="text-xs text-teal-300 uppercase tracking-wider">Technology</p>
                            </div>
                        </div>
                        <p className="text-sm text-slate-300 leading-relaxed">
                            Modern software engineering and intelligent technology solutions for the digital era.
                        </p>
                        {/* Social Icons */}
                        <div className="flex gap-3 pt-2">
                            <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="w-9 h-9 bg-[#083d4a] hover:bg-teal-600 rounded flex items-center justify-center transition-colors">
                                <Twitter size={16} className="text-white" />
                            </a>
                            <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="w-9 h-9 bg-[#083d4a] hover:bg-teal-600 rounded flex items-center justify-center transition-colors">
                                <Linkedin size={16} className="text-white" />
                            </a>
                            <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="w-9 h-9 bg-[#083d4a] hover:bg-teal-600 rounded flex items-center justify-center transition-colors">
                                <Instagram size={16} className="text-white" />
                            </a>
                        </div>
                    </div>

                    {/* Navigation Links */}
                    <div className="space-y-4">
                        <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4">Navigation</h3>
                        <ul className="space-y-2.5 text-sm">
                            <li>
                                <Link to={`${rolePrefix}/dashboard`} className="text-slate-300 hover:text-teal-400 transition-colors duration-200 hover:translate-x-1 inline-block">
                                    Dashboard
                                </Link>
                            </li>
                            {!isEmployee && (
                                <>
                                    <li>
                                        <Link to={`${rolePrefix}/documents`} className="text-slate-300 hover:text-teal-400 transition-colors duration-200 hover:translate-x-1 inline-block">
                                            Documents
                                        </Link>
                                    </li>
                                    <li>
                                        <Link to={`${rolePrefix}/modules`} className="text-slate-300 hover:text-teal-400 transition-colors duration-200 hover:translate-x-1 inline-block">
                                            Modules
                                        </Link>
                                    </li>
                                    <li>
                                        <Link to={`${rolePrefix}/trainings`} className="text-slate-300 hover:text-teal-400 transition-colors duration-200 hover:translate-x-1 inline-block">
                                            Trainings
                                        </Link>
                                    </li>
                                </>
                            )}
                            <li>
                                <Link to={`${rolePrefix}/certifications`} className="text-slate-300 hover:text-teal-400 transition-colors duration-200 hover:translate-x-1 inline-block">
                                    Certifications
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Contact Info */}
                    <div className="space-y-4">
                        <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4">Contact</h3>
                        <div className="space-y-3 text-sm">
                            <div className="flex items-start gap-3 text-slate-300">
                                <MapPin size={18} className="text-teal-400 mt-0.5 flex-shrink-0" />
                                <span>Bangalore, Karnataka, India</span>
                            </div>
                            <div className="flex items-center gap-3 text-slate-300">
                                <Phone size={18} className="text-teal-400 flex-shrink-0" />
                                <a href="tel:+917975946713" className="hover:text-teal-400 transition-colors">
                                    +91 79759 46713
                                </a>
                            </div>
                            <div className="flex items-center gap-3 text-slate-300">
                                <Mail size={18} className="text-teal-400 flex-shrink-0" />
                                <a href="mailto:wizdom.groups@gmail.com" className="hover:text-teal-400 transition-colors">
                                    wizdom.groups@gmail.com
                                </a>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Bottom Bar */}
                <div className="mt-10 pt-6 border-t border-[#083d4a]">
                    <div className="flex flex-col md:flex-row justify-center items-center gap-2">
                        <p className="text-sm text-slate-400 text-center">
                            © {currentYear} Wizdom Group. All rights reserved.
                        </p>
                    </div>
                </div>
            </div>

            {/* Scroll to Top Button */}
            <button
                onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                className="fixed bottom-6 right-6 w-12 h-12 bg-teal-600 hover:bg-teal-500 text-white rounded-full shadow-lg flex items-center justify-center transition-all hover:scale-110 z-40"
                aria-label="Scroll to top"
            >
                <span className="text-xl">↑</span>
            </button>
        </footer>
    );
};

export default Footer;

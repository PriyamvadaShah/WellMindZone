'use client'

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from 'framer-motion';
import { FaUser, FaSignInAlt, FaBars, FaTimes } from 'react-icons/fa';
import Logo from '../assets/healthlogo.jpeg';
import './Header.css';
import Image from "next/image";

const Header = () => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [activeItem, setActiveItem] = useState('/');
    const pathname = usePathname();

    useEffect(() => {
        setActiveItem(pathname);
    }, [pathname]);

    const navItems = [
        { title: 'Home', path: '/' },
        { title: 'About', path: '/about-us' }, 
        { title: 'Features', path: '/features' },
        { title: 'Appointments', path: '/appointments' },
        { title: 'Doctors', path: '/doctors' },
        { title: 'Contact', path: '/contact-us' },
    ];

    return (
        <header className="bg-green-600 py-3 px-5">
            <div className="container mx-auto">
                <div className="flex justify-between items-center">
                    <Link href="/" className="flex items-center space-x-2">
                        <Image src={Logo} alt="Health Nest Logo" className="h-10 w-auto" />
                        <span className="text-2xl font-bold text-accent">WellMind Zone</span>
                    </Link>

                    <nav className="hidden md:flex space-x-1 font-main">
                        {navItems.map((item) => (
                            <Link
                                key={item.path}
                                href={item.path}
                                className={`relative px-3 py-2 text-base text-light hover:text-accent transition-colors duration-300 ${
                                    activeItem === item.path ? 'text-accent' : ''
                                }`}
                            >
                                {item.title}
                                {activeItem === item.path && (
                                    <motion.div
                                        className="absolute bottom-0 left-0 right-0 h-0.5 bg-accent"
                                        layoutId="underline"
                                        initial={false}
                                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                                    />
                                )}
                            </Link>
                        ))}
                    </nav>

                    <div className="hidden md:flex items-center space-x-3">
                        <Link href="/signup" className="bg-pink-400 text-primary px-4 py-1.5 rounded-full hover:bg-light transition duration-300 text-sm font-medium">
                            <FaUser className="inline-block mr-1" />Sign Up
                        </Link>
                        <Link href="/login" className="bg-light text-primary px-4 py-1.5 rounded-full hover:bg-accent transition duration-300 text-sm font-medium">
                            <FaSignInAlt className="inline-block mr-1" />Log In
                        </Link>
                    </div>

                    <button 
                        className="md:hidden text-light focus:outline-none"
                        onClick={() => setIsMenuOpen(!isMenuOpen)}
                    >
                        {isMenuOpen ? <FaTimes size={24} /> : <FaBars size={24} />}
                    </button>
                </div>

                <AnimatePresence>
                    {isMenuOpen && (
                        <motion.div
                            initial={{ opacity: 0, y: -20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            transition={{ duration: 0.3 }}
                            className="md:hidden mt-3"
                        >
                            {navItems.map((item) => (
                                <Link
                                    key={item.path}
                                    href={item.path}
                                    className={`block py-2 px-3 text-base font-medium text-light hover:text-accent transition duration-300 ${
                                        activeItem === item.path ? 'text-accent' : ''
                                    }`}
                                    onClick={() => setIsMenuOpen(false)}
                                >
                                    {item.title}
                                </Link>
                            ))}
                            <Link
                                href="/signup"
                                className="block py-2 px-3 text-base font-medium text-light hover:text-accent transition duration-300"
                                onClick={() => setIsMenuOpen(false)}
                            >
                                <FaUser className="inline-block mr-1" />Sign Up
                            </Link>
                            <Link
                                href="/login"
                                className="block py-2 px-3 text-base font-medium text-light hover:text-accent transition duration-300"
                                onClick={() => setIsMenuOpen(false)}
                            >
                                <FaSignInAlt className="inline-block mr-1" />Log In
                            </Link>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </header>
    );
};

export default Header;

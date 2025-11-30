import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Feather, ArrowUpRight, CheckCircle2, Layout, Globe, Zap } from "lucide-react";
import { type BlogPost } from "../types";
import HeroImage from "../assets/hero_reading.png";
import FeatureWriting from "../assets/feature_writing.png";
import FeatureCommunity from "../assets/feature_community.png";
import BackgroundAnimation from "../components/BackgroundAnimation";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

export default function HomePage() {
    const [featuredBlogs, setFeaturedBlogs] = useState<BlogPost[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchFeatured = async () => {
            try {
                const response = await fetch(
                    `${BACKEND_URL}/api/blogs?status=published&sort=-viewCount&limit=3`
                );
                const data = await response.json();
                if (data.status === "success") {
                    setFeaturedBlogs(data.data.blogs);
                }
            } catch (error) {
                console.error("Error fetching featured blogs:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchFeatured();
    }, []);

    return (
        <div className="min-h-screen bg-white text-gray-900 font-sans selection:bg-black selection:text-white relative overflow-hidden">
            <BackgroundAnimation />

            {/* Navigation */}
            <nav className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
                <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
                    <div className="flex items-center gap-2 font-bold text-xl tracking-tighter">
                        <div className="w-8 h-8 bg-black text-white rounded-lg flex items-center justify-center">
                            <Feather className="w-5 h-5" />
                        </div>
                        <span>Bloging.</span>
                    </div>
                    <div className="flex items-center gap-6">
                        <Link
                            to="/login"
                            className="text-sm font-medium text-gray-600 hover:text-black transition-colors hidden md:block"
                        >
                            Sign In
                        </Link>
                        <Link
                            to="/register"
                            className="px-5 py-2.5 bg-black text-white text-sm font-bold rounded-full hover:bg-gray-800 transition-all hover:scale-105 active:scale-95"
                        >
                            Get Started
                        </Link>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <section className="pt-32 pb-20 px-6 relative z-10">
                <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-16 items-center">
                    <div className="text-left">
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gray-50 border border-gray-100 text-xs font-bold uppercase tracking-widest text-gray-500 mb-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
                            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                            The Future of Digital Storytelling
                        </div>
                        <h1 className="text-5xl md:text-7xl font-serif font-medium tracking-tight mb-8 leading-[1.1] animate-in fade-in slide-in-from-bottom-8 duration-1000 fill-mode-both">
                            Craft stories that <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-gray-900 via-gray-600 to-gray-900 animate-gradient">
                                matter to the world.
                            </span>
                        </h1>
                        <p className="text-xl text-gray-500 max-w-xl mb-10 leading-relaxed animate-in fade-in slide-in-from-bottom-12 duration-1000 delay-200 fill-mode-both">
                            A minimal, distraction-free platform designed for writers who value
                            clarity, aesthetics, and reaching a global audience.
                        </p>
                        <div className="flex flex-col sm:flex-row items-start gap-4 animate-in fade-in slide-in-from-bottom-16 duration-1000 delay-300 fill-mode-both">
                            <Link
                                to="/register"
                                className="px-8 py-4 bg-black text-white font-bold rounded-full hover:bg-gray-800 transition-all hover:scale-105 flex items-center gap-2 group"
                            >
                                Start Writing
                                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                            </Link>
                            <Link
                                to="/blogs"
                                className="px-8 py-4 bg-white border border-gray-200 text-gray-900 font-bold rounded-full hover:bg-gray-50 transition-all hover:border-gray-300"
                            >
                                Read Stories
                            </Link>
                        </div>
                    </div>
                    <div className="relative animate-in fade-in zoom-in duration-1000 delay-500">
                        <div className="absolute -inset-4 bg-gradient-to-r from-gray-100 to-gray-50 rounded-[2.5rem] -z-10 transform rotate-2"></div>
                        <img
                            src={HeroImage}
                            alt="Person reading on a tablet"
                            className="rounded-3xl shadow-2xl w-full object-cover aspect-[4/3] transform hover:scale-[1.02] transition-transform duration-700"
                        />
                    </div>
                </div>
            </section>

            {/* Featured Section */}
            <section className="py-24 bg-gray-50/80 backdrop-blur-sm border-y border-gray-100 relative z-10">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="flex items-end justify-between mb-12">
                        <div>
                            <h2 className="text-3xl font-bold tracking-tight mb-2">Trending Stories</h2>
                            <p className="text-gray-500">Curated reads from our top creators.</p>
                        </div>
                        <Link to="/blogs" className="hidden md:flex items-center gap-2 text-sm font-bold border-b border-black pb-0.5 hover:opacity-70 transition-opacity">
                            View all <ArrowRight className="w-4 h-4" />
                        </Link>
                    </div>

                    {loading ? (
                        <div className="grid md:grid-cols-3 gap-8">
                            {[1, 2, 3].map((i) => (
                                <div key={i} className="h-96 bg-gray-200 rounded-2xl animate-pulse"></div>
                            ))}
                        </div>
                    ) : (
                        <div className="grid md:grid-cols-3 gap-8">
                            {featuredBlogs.map((blog) => (
                                <Link
                                    key={blog.id}
                                    to={`/view/${blog.id}`}
                                    className="group relative bg-white rounded-2xl p-8 shadow-sm hover:shadow-xl transition-all duration-500 hover:-translate-y-1"
                                >
                                    <div className="absolute top-8 right-8 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <ArrowUpRight className="w-5 h-5 text-gray-400" />
                                    </div>
                                    <div className="flex items-center gap-3 mb-6">
                                        <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center text-xs font-bold text-gray-600">
                                            {blog.author?.name?.charAt(0) || "A"}
                                        </div>
                                        <span className="text-xs font-bold uppercase tracking-wider text-gray-500">
                                            {blog.author?.name || "Anonymous"}
                                        </span>
                                    </div>
                                    <h3 className="text-2xl font-bold mb-4 leading-tight group-hover:text-gray-700 transition-colors">
                                        {blog.title}
                                    </h3>
                                    <p className="text-gray-500 font-serif leading-relaxed line-clamp-3 mb-6">
                                        Read the full story to explore the depths of this topic and discover new perspectives...
                                    </p>
                                    <div className="flex items-center gap-4 text-xs font-medium text-gray-400 uppercase tracking-wide mt-auto">
                                        <span>{new Date(blog.publishedAt!).toLocaleDateString()}</span>
                                        <span>•</span>
                                        <span>{blog.viewCount || 0} reads</span>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    )}
                    <div className="mt-12 text-center md:hidden">
                        <Link to="/blogs" className="inline-flex items-center gap-2 text-sm font-bold border-b border-black pb-0.5">
                            View all stories <ArrowRight className="w-4 h-4" />
                        </Link>
                    </div>
                </div>
            </section>

            {/* What We Provide Section */}
            <section className="py-32 px-6 overflow-hidden relative z-10">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-20">
                        <h2 className="text-4xl md:text-5xl font-serif font-medium mb-6">Redefining the Reading Experience</h2>
                        <p className="text-xl text-gray-500 max-w-2xl mx-auto">We provide the tools and environment you need to grow as a writer and reader.</p>
                    </div>

                    <div className="grid lg:grid-cols-2 gap-24 items-center mb-32">
                        <div className="order-2 lg:order-1">
                            <img
                                src={FeatureWriting}
                                alt="Creative writing interface"
                                className="rounded-3xl shadow-2xl w-full transform hover:scale-[1.02] transition-transform duration-700"
                            />
                        </div>
                        <div className="order-1 lg:order-2">
                            <h3 className="text-3xl font-bold mb-6">Unleash Your Creativity</h3>
                            <p className="text-lg text-gray-500 leading-relaxed mb-8">
                                Our distraction-free editor is engineered to keep you in the flow. With powerful formatting tools and a clean interface, your ideas take center stage.
                            </p>
                            <ul className="space-y-4">
                                {[
                                    "Minimalist, focus-driven interface",
                                    "Rich media support for immersive stories",
                                    "Real-time saving and cloud sync"
                                ].map((item, i) => (
                                    <li key={i} className="flex items-center gap-3 font-medium text-gray-800">
                                        <CheckCircle2 className="w-5 h-5 text-green-500" />
                                        {item}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>

                    <div className="grid lg:grid-cols-2 gap-24 items-center">
                        <div>
                            <h3 className="text-3xl font-bold mb-6">Connect Globally</h3>
                            <p className="text-lg text-gray-500 leading-relaxed mb-8">
                                Join a vibrant community of thinkers and creators. Share your unique perspective with the world and engage in meaningful conversations.
                            </p>
                            <ul className="space-y-4">
                                {[
                                    "Instant global publishing",
                                    "Interactive comments and discussions",
                                    "Curated discovery for wider reach"
                                ].map((item, i) => (
                                    <li key={i} className="flex items-center gap-3 font-medium text-gray-800">
                                        <CheckCircle2 className="w-5 h-5 text-blue-500" />
                                        {item}
                                    </li>
                                ))}
                            </ul>
                        </div>
                        <div>
                            <img
                                src={FeatureCommunity}
                                alt="Global community network"
                                className="rounded-3xl shadow-2xl w-full transform hover:scale-[1.02] transition-transform duration-700"
                            />
                        </div>
                    </div>
                </div>
            </section>

            {/* Features Grid */}
            <section className="py-32 px-6 relative z-10">
                <div className="max-w-7xl mx-auto">
                    <div className="grid md:grid-cols-3 gap-16">
                        <div className="space-y-4">
                            <div className="w-12 h-12 bg-black text-white rounded-xl flex items-center justify-center mb-6">
                                <Layout className="w-6 h-6" />
                            </div>
                            <h3 className="text-xl font-bold">Distraction-free Editor</h3>
                            <p className="text-gray-500 leading-relaxed">
                                Our minimal editor gets out of your way, letting you focus entirely on your words and ideas.
                            </p>
                        </div>
                        <div className="space-y-4">
                            <div className="w-12 h-12 bg-black text-white rounded-xl flex items-center justify-center mb-6">
                                <Globe className="w-6 h-6" />
                            </div>
                            <h3 className="text-xl font-bold">Global Reach</h3>
                            <p className="text-gray-500 leading-relaxed">
                                Publish your stories to a worldwide audience instantly. Connect with readers from every corner of the globe.
                            </p>
                        </div>
                        <div className="space-y-4">
                            <div className="w-12 h-12 bg-black text-white rounded-xl flex items-center justify-center mb-6">
                                <Zap className="w-6 h-6" />
                            </div>
                            <h3 className="text-xl font-bold">Lightning Fast</h3>
                            <p className="text-gray-500 leading-relaxed">
                                Built on modern technology for instant page loads and smooth interactions. Your readers won't wait.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="bg-black text-white py-20 px-6 relative z-10">
                <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
                    <div className="flex items-center gap-2 font-bold text-2xl tracking-tighter">
                        <Feather className="w-6 h-6" />
                        <span>Bloging.</span>
                    </div>
                    <div className="flex gap-8 text-sm font-medium text-gray-400">
                        <a href="#" className="hover:text-white transition-colors">Privacy</a>
                        <a href="#" className="hover:text-white transition-colors">Terms</a>
                        <a href="#" className="hover:text-white transition-colors">Twitter</a>
                        <a href="#" className="hover:text-white transition-colors">GitHub</a>
                    </div>
                    <p className="text-gray-500 text-sm">
                        © {new Date().getFullYear()} Bloging Inc.
                    </p>
                </div>
            </footer>
        </div>
    );
}

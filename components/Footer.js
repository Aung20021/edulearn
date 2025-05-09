import Link from "next/link";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";

export default function Footer() {
  const router = useRouter();
  const { pathname } = router;
  const { data: session } = useSession();
  if (session) {
    return (
      <footer className="bg-white border-t border-gray-200 text-gray-700 mt-10">
        <div className="max-w-7xl mx-auto px-4 py-10 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Logo and tagline */}
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                {/* Replace with your logo SVG */}
                <div className="w-10 h-10 m-7">
                  {/* Placeholder logo */}
                  <svg
                    version="1.0"
                    xmlns="http://www.w3.org/2000/svg"
                    width="60" // Set desired width
                    height="60" // Set desired height, keeping the aspect ratio balanced
                    viewBox="0 0 180 180"
                  >
                    <path d="M139 24.7c-1.4.3-5.7 2-9.6 3.8-8.4 4.1-15.3 10.9-17.9 18-2.3 6.2-2.1 6-4 4.5-1.9-1.6-1.9-.6.1 2.5.9 1.3 1.3 2.8 1 3.4-.3.5.1 1.2 1 1.5 1.3.5 1.5 1.6 1.1 4.9-.3 2.3-.3 3.4 0 2.4.2-.9.9-1.7 1.5-1.7 1.1 0 .7 2.9-.8 6.5-.7 1.7-.6 1.8.8.7 2.5-2 2.8 1.5.6 6-2.1 4.4-2.4 7.2-.4 4.5 3.6-4.7 3.9 0 .4 5.8-1 1.6-1.8 3.9-1.7 5 0 1.9.1 1.8 1.1-.3.6-1.2 1.4-2.2 1.8-2.2 1.1 0 1.9 5 .9 5.6-1.4.8-4.9 8.1-4.9 10.1.1 1.7.1 1.7 1.2-.1 2.9-5 6.1-7.1 7-4.4.3.8 1.5.5 3.6-1.1 4.3-3 8.4-4.3 16.2-5l6.5-.6-.2-19c-.4-27-1.4-51.5-2.2-51.4-.3.1-1.7.4-3.1.6m.1 4.5c1-.2 1.6.3 1.6 1-.1.7.2 4.9.6 9.3s1 16.9 1.3 27.9c.2 10.9.5 20.1.6 20.5.5 4.1-.2 4.8-5.9 5.5-6.3.7-17.3 4.5-17.3 6 0 .5-.9.1-2-.9-1.5-1.3-1.7-2.1-.9-3.1s.7-2.1-.4-4.3c-1.2-2.4-1.2-3.2-.3-4.1 1.6-1.3 1.2-8.6-.4-8.2-.7.1-.4-1 .6-2.7s2.2-2.7 2.8-2.3c.6.3-.1-.8-1.6-2.6-1.6-1.9-3-5.1-3.4-7.8-.3-2.5-1.2-5.1-1.8-5.7-1.7-1.9-1.8-3.5-.1-6.6.8-1.6 1.2-3.1 1-3.5-.3-.3-.2-.4.2-.1.9.7 3.2-2.7 3.3-4.8 0-1 .4-1.6.9-1.3s1.1-.1 1.4-.9c.4-1 .1-1.2-1.1-.9-.9.3.3-.5 2.8-1.8s4.5-2.9 4.5-3.6c0-1.7 9.5-6.3 10.9-5.4.6.3 1.8.5 2.7.4" />
                    <path d="M71 37.8v8.8l-10.5-.4-10.5-.4v35.6c0 19.6.2 35.6.4 35.6s2.3-.7 4.6-1.5 5.3-1.5 6.6-1.5 2.4-.4 2.4-.8-2.6-.7-5.8-.7c-5.7.2-5.8.1-5.5-2.4.2-1.4.5-15.7.6-31.6l.2-29 7-.1c4.3-.1 7.3.3 7.7 1 .4.6.5 4 .3 7.6-1.1 15.4-1.5 41-.7 41 .5 0 1.2-11.4 1.5-25.3.7-23.5.8-25.3 2.7-26.9 1.3-1 2-2.9 2-5 0-1.8.3-4.3.6-5.6.6-2 1.1-2.2 3.8-1.6 1.7.3 3.4 1.1 3.7 1.7.4.5 1.2.6 1.8.3.6-.4 1.1 0 1.1.9s.4 1.4.9 1c.5-.3 1.2-.1 1.6.5s1 .8 1.5.5 2.3.8 4.1 2.4c1.8 1.7 3.7 2.7 4.2 2.4s.4.4-.2 1.5c-.9 1.7-.8 1.9.9 1.5 1.4-.4 2 .1 2.4 1.8 2.3 11.6 2.7 14.9 2.1 16-.5.6-1 2.6-1.2 4.3s-.8 3.3-1.3 3.4c-.6.2-.7.8-.4 1.3.3.6.1 1.5-.4 2.2-.6.7-1 1.6-1.1 2.2 0 2.1-4.4 10.4-5.2 9.9-.5-.3-.6.2-.3 1 .3.9.1 1.6-.5 1.6-.7 0-.9.9-.5 2.4.5 2 0 2.7-2.3 4-1.5.8-2.2 1.5-1.5 1.6.6 0 1.2.5 1.2 1.1 0 .5-.6.7-1.2.3-.8-.5-.7 0 .2 1.1 1.4 1.7 1.5 1.7 2.4-.8.6-1.5 1.5-2.7 2-2.7 1.7 0 6.9 3.7 8.7 6.2 1 1.2 2.1 2 2.4 1.6.9-.9-3.9-8.2-7-10.7-2.1-1.6-2.6-2.6-2.1-4.6.9-3.4 2.6-3.1 6.6 1 1.8 1.9 3.5 3.3 3.8 3.1.6-.7-1.8-4.9-4.5-7.7-2.1-2.3-2.2-2.9-1.2-5.3 1.5-3.3 2.2-3.3 5.4.1 3 3.3 3.5 1.1.5-2.7s-2.4-9.4.7-6.9c1.7 1.5 1.7.5-.2-3.2-1.6-2.9-1.2-5.5.6-4.4 1.3.8 1.1 0-.6-4.2-1.7-4.1-1.9-5.7-.5-4.8 1.4.8 1.3.3-.8-4.4-1.7-3.7-5.6-8.5-9.6-11.8-2.7-2.2-13-7.1-18.3-8.7L71 29.1zm82.7 2.9c-10.4.4-11 2.3-.7 2.3 5 0 6.9.4 7.3 1.4.8 2 .9 58 .2 60.9-.5 1.9-1.2 2.3-3.3 2-2.6-.4-2.6-.4-.8 1.1 1.1.9 2.8 1.6 3.8 1.6s1.8.4 1.8 1c0 .5.5 1 1 1 .6 0 1-12.7 1-36 0-19.8-.3-35.9-.7-35.8-.5.1-4.8.4-9.6.5" />
                    <path d="M70.7 102.6c.3.9.8 1.2 1.2.5.7-1 2.4-.9 9.8.3 4.2.8 8.3 3.4 8.3 5.4 0 .5.7 1.3 1.6 1.6 1 .4 1.3.2.8-.7-.4-.6.2-.3 1.3.8s1.8 2.4 1.5 2.9 0 .6.5.3c1.3-.8 2.7.9 4.1 5 .7 2 .7 3.3.1 3.3-.5 0-.9-.7-.9-1.6 0-1-.6-1.4-1.5-1-.8.3-2-.1-2.7-.8s-2.7-1.6-4.3-2c-2.6-.6-2.4-.3 1.3 1.9 2.4 1.4 4.9 2.2 5.5 1.8.5-.3.7-.1.3.5-.3.5.6 1.9 2.1 3 2.4 1.8 2.6 2.3 1.4 3.4s-1.3 1.1-.6-.1c.6-1.1.3-1.3-1.3-.9-1.2.4-2.2.2-2.2-.3s-.5-.9-1.1-.9-1.7-.7-2.5-1.5c-.9-.8-2.3-1.4-3.2-1.4-1.5.1-1.5.2.1.6 2.7.7 2 2.1-.8 1.5-1.4-.2-2.2-.8-1.9-1.3s-.2-.9-1.1-.9-1.4.4-1.1.9c.4.5-.3.7-1.5.4-1.3-.4-1.8-1.1-1.4-2.1.4-1.2 0-1.1-1.6.4-1.2 1-1.9 1.4-1.5.7.7-1.3-2.9-1.2-6.9.2-1.7.6-1.8.5-.5-.5s1.2-1.1-.3-.6c-1 .3-2.5.6-3.3.6-.9 0-1.3.4-1 .9.4.5 0 .8-.6.7-2.7-.4-4-1.9-3.5-4.2.2-1.3 0-2.4-.5-2.4s-.6-.5-.2-1.1c.4-.7.1-1-.7-.7-.9.3-1.5 2.5-1.7 6.6-.2 3.4 0 6.2.4 6.2.3 0 3.4-.7 6.8-1.6 8.3-2.2 20.3-1.5 27.3 1.5 4.3 1.9 5.4 2.9 6.4 6 1.6 4.9 6.1 11.9 6.7 10.3.2-.7-.1-1.8-.7-2.5-1.8-2.3-4.1-12.9-4.1-19.4 0-5.8-.3-6.6-3.6-10.3-6.3-7-15.4-11-25.1-11-3.5 0-4.1.3-3.6 1.6m45.5 4.1c-4.5 6.6-6.4 12.4-5.7 17.5l.7 5 2.7-2.5c5.1-4.9 11.6-7 22.1-7 6.7 0 10.8.6 13.8 1.8 2.4 1 4.4 1.6 4.5 1.4.2-.2.1-3.5-.1-7.3l-.4-6.9-8.1.6c-4.5.3-9.3 1-10.7 1.6l-2.5 1.2 2.5-.6c1.4-.3 5.5-.8 9.1-1.2 6.2-.5 6.7-.4 7.4 1.6.3 1.1.4 2.9.1 3.9-.5 1.6-1.9 1.8-11.9 1.8-11 0-17.6.6-19.7 1.9-.5.3-.7 0-.4-.8.5-1.4 7.1-4.7 9.2-4.7.7 0 1.2-.5 1.2-1 0-1.3-.3-1.3-3.7.2-4.6 2-11.4 6.9-10.8 7.8.3.4-.4.6-1.5.3-1.2-.3-2 0-2 .8 0 .7-.3 1-.6.7-.7-.8 1.5-5.1 3.2-6.1.7-.4 1.1-1.4.8-2.2-.4-.8-.1-1.5.6-1.5s.9-.8.5-2c-.8-2.5.3-2.6 2.2-.3 1.3 1.6 1.3 1.5.3-.6-.7-1.3-.8-2.6-.4-3 1.3-.9 1.6-3.1.5-3.1-.5 0-1.8 1.2-2.9 2.7" />
                    <path d="M77.1 114.4c3 .7 6.4 1.6 7.5 2 1.7.6 1.7.6.4-.8-1-1-4-1.8-7.5-2l-6-.5zm-2.9 42.1c.5 4.2-.3 5.8-1.7 3.5-1.3-2-6.3-1.1-8.4 1.6-4.2 5.3-1.2 14.4 4.8 14.4 1.5 0 3.2-.5 3.9-1.2.9-.9 1.2-.9 1.2 0 0 .7 1 1.2 2.3 1.2 2.2 0 2.2-.2 2-11.2-.1-6.2-.2-11.6-.3-12.1 0-.4-1-.7-2.1-.7-2 0-2.1.4-1.7 4.5m-1.4 6.7c2 2 1.5 7.6-.9 8.8-4.3 2.4-8-4.8-4.3-8.4 1.9-1.9 3.6-2 5.2-.4m30.2.8c0 11.3.1 12 2 12s2-.7 2-12-.1-12-2-12-2 .7-2 12m-59.9 1-.2 11H51c7.3 0 8-.2 8-2s-.7-2-5.4-2c-4.5 0-5.5-.3-5.9-1.9-.7-2.7 0-3.1 5-3.1 3.6 0 4.3-.3 4.3-2s-.7-2-4.5-2c-4.1 0-4.5-.2-4.5-2.5 0-2.4.3-2.5 5.5-2.5 4.8 0 5.5-.2 5.5-2s-.7-2-7.9-2h-7.9zm39.9.8c0 5.4.4 7.2 1.8 8.5 2.2 2 6.8 2.2 7.6.4.5-1 .7-1 1.2 0 .3.7 1.4 1.3 2.5 1.3 1.7 0 1.9-.8 1.9-8.5 0-7.8-.2-8.5-2-8.5-1.7 0-2 .7-2 5.3 0 6-1.7 9.2-4.3 8.1-2.1-.8-3-4.1-2.5-9.4.3-3.6.1-4-1.9-4-2.2 0-2.3.4-2.3 6.8m32.2-6.1c-.7.3-1.9 1.8-2.8 3.5-2 3.9-1.1 9.2 1.9 11.3 2.6 1.8 7.7 2 10.1.2 1.6-1.2 1.6-1.5.3-2.6-1-.8-1.7-.9-2.2-.1-1.4 2.2-7.5.5-7.5-2.2 0-.4 2.7-.8 6-.8 6 0 6 0 6-3 0-5.4-6.1-8.6-11.8-6.3m6.2 2.9c3.3 1.3 1.7 3.4-2.4 3.4s-4.9-.7-2.8-2.8c1.3-1.3 2.8-1.5 5.2-.6m10.7-2.7c-.8.5-1.1 1.6-.8 2.4.5 1.3 1.1 1.4 3.6.4 2.3-.8 3.3-.8 4.5.2 2.2 1.9 1.1 3.1-2.9 2.9-1.9-.1-4.1.5-5 1.2-2 1.7-1.9 5.3.3 7.3s6.8 2.2 7.6.4c.5-1 .7-1 1.2 0 .3.7 1.3 1.3 2.3 1.3 1.4 0 1.6-.9 1.3-7.3-.2-3.9-.9-7.8-1.4-8.5-1.2-1.4-8.6-1.6-10.7-.3m8.2 8.7c1.1 1.2-1.3 4.4-3.4 4.4-2.4 0-3.7-2.9-1.8-4.1 1.6-1 4.3-1.2 5.2-.3m8.7-1.1c0 8.4 0 8.5 2.5 8.5 1.8 0 2.3-.4 1.9-1.5-1.2-2.9.6-10.4 2.5-11 2-.6 3.6-4.5 1.8-4.5-.6 0-1.9.7-2.9 1.7-1.7 1.5-1.8 1.5-1.8 0 0-1-.8-1.7-2-1.7-1.8 0-2 .7-2 8.5m13 0c0 7.8.2 8.5 2 8.5s2-.7 2-5.8c0-6 1.1-8.2 4.2-8.2 2.2 0 3.1 3.4 2.6 9.5-.3 4.1-.1 4.5 1.9 4.5 2.1 0 2.3-.4 2.3-6.3 0-7.4-1.8-10.7-5.9-10.7-1.5 0-3.2.5-3.9 1.2-.9.9-1.2.9-1.2 0 0-.7-.9-1.2-2-1.2-1.8 0-2 .7-2 8.5" />
                  </svg>
                </div>
              </div>
              <p
                className="font-bold bg-clip-text text-transparent"
                style={{
                  backgroundImage: "linear-gradient(270deg, #10B981, #3B82F6)",
                  backgroundSize: "400% 400%",
                  animation: "gradientShift 4s ease infinite",
                }}
              >
                Empowering education with AI.
              </p>
            </div>

            {/* Navigation */}
            <div>
              <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide">
                Quick Links
              </h3>
              <ul className="mt-4 space-y-2 text-sm">
                <li>
                  <Link
                    href="/courses"
                    className="hover:text-teal-600 transition-colors"
                  >
                    Courses
                  </Link>
                </li>
                <li>
                  <Link
                    href="/archived"
                    className="hover:text-teal-600 transition-colors"
                  >
                    Archived
                  </Link>
                </li>
                <li>
                  <Link
                    href="/settings"
                    className="hover:text-teal-600 transition-colors"
                  >
                    Settings
                  </Link>
                </li>
              </ul>
            </div>

            {/* Contact and credits */}
            <div>
              <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide">
                Connect
              </h3>
              <p className="mt-4 text-sm text-gray-500">
                Email: aungmyintmyat19131@gmail.com
              </p>
              <p className="text-sm text-gray-500">
                © {new Date().getFullYear()} EduLearn. All rights reserved.
              </p>
            </div>
          </div>
        </div>
      </footer>
    );
  }
}

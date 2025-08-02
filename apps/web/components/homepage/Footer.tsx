const Footer = () => {
  return (
    <footer id="contact" className="bg-gray-900 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main Footer Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          
          {/* Brand / About */}
          <div>
            <h3 className="text-white text-2xl font-bold mb-4">CHESSMASTERS</h3>
            <p className="text-gray-400 text-sm leading-relaxed">
              Experience chess like never before with our built-in live video calling, 
              powered by low-latency WebRTC technology.
            </p>
          </div>

          {/* Quick Links */}
          <div className="flex flex-col items-start">
            <h4 className="text-white text-lg font-semibold mb-4">QUICK LINKS</h4>
            <ul className="space-y-2 text-sm">
              <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Home</a></li>
              <li><a href="https://github.com/kushalbhana/Chessmasters-multiplayer" className="text-gray-400 hover:text-white transition-colors">Github</a></li>
              <li><a href="https://kushalbhana.vercel.app/" className="text-gray-400 hover:text-white transition-colors">Portfolio</a></li>
              <li><a href="#contact" className="text-gray-400 hover:text-white transition-colors">Contact</a></li>
            </ul>
          </div>

          {/* Contact Info */}
          <div className="flex flex-col items-start">
            <h4 className="text-white text-lg font-semibold mb-4">CONTACT INFO</h4>
            <div className="space-y-2 text-gray-400 text-sm leading-relaxed break-words">
              <p>Email: kushalbhana@gmail.com</p>
              <p>Phone: +91 You can Email</p>
              <p>
                VIT Bhopal University,
                <br /> Kothri Kalan, Sehore,
                <br /> Madhya Pradesh, 466116
              </p>
            </div>
          </div>
        </div>

        {/* Bottom Footer */}
        <div className="border-t border-gray-800 mt-12 pt-6 text-center">
          <p className="text-gray-400 text-sm">
            © 2025 ChessMasters. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

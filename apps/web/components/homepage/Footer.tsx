const Footer = () => {
  return (
    <footer id="contact" className="bg-gray-900 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-white text-2xl font-bold mb-4">CHESSSHOCKER</h3>
            <p className="text-gray-400">
              Premium chess sets crafted with precision and elegance for chess enthusiasts worldwide.
            </p>
          </div>
          
          <div>
            <h4 className="text-white text-lg font-semibold mb-4">QUICK LINKS</h4>
            <ul className="space-y-2">
              <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Home</a></li>
              <li><a href="#pieces" className="text-gray-400 hover:text-white transition-colors">Chess Pieces</a></li>
              <li><a href="#board" className="text-gray-400 hover:text-white transition-colors">Chessboard</a></li>
              <li><a href="#contact" className="text-gray-400 hover:text-white transition-colors">Contact</a></li>
            </ul>
          </div>
          
          <div>
            <h4 className="text-white text-lg font-semibold mb-4">CONTACT INFO</h4>
            <div className="space-y-2 text-gray-400">
              <p>Email: kushalbhana@gmail.com.com</p>
              <p>Phone: +1 (555) 123-4567</p>
              <p>Address: Boys Hostel 2, VIT Bhopal University, Kothri Kalan. Sehore, Madhya Pradesh, 466116</p>
            </div>
          </div>
        </div>
        
        <div className="border-t border-gray-800 mt-8 pt-8 text-center">
          <p className="text-gray-400">
            © 2025 ChessMasters. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
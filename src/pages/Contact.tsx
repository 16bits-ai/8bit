import React from 'react';
import ParallaxBackground from '../components/ParallaxBackground';

const Contact: React.FC = () => {
  return (
    <div className="relative w-full min-h-screen bg-black">
      <ParallaxBackground color="#FFE66D" variant="lines" />

      <div className="relative z-10 container mx-auto px-4 py-20">
        <h1
          className="text-5xl md:text-7xl font-bold mb-12 text-center"
          style={{
            fontFamily: '"Press Start 2P", cursive',
            color: '#FFE66D',
            textShadow: '0 0 10px #FFE66D'
          }}
        >
          CONTACT
        </h1>

        <div className="max-w-2xl mx-auto">
          <div
            className="border-4 border-[#FFE66D] bg-black/80 p-8"
            style={{
              fontFamily: '"Press Start 2P", cursive',
              color: '#FFE66D'
            }}
          >
            <form className="space-y-6">
              <div>
                <label className="block text-sm mb-2">NAME:</label>
                <input
                  type="text"
                  className="w-full bg-black border-2 border-[#FFE66D] p-3 text-[#FFE66D] focus:outline-none focus:border-[#FFE66D] focus:shadow-[0_0_10px_#FFE66D]"
                  style={{ fontFamily: '"Press Start 2P", cursive' }}
                />
              </div>

              <div>
                <label className="block text-sm mb-2">EMAIL:</label>
                <input
                  type="email"
                  className="w-full bg-black border-2 border-[#FFE66D] p-3 text-[#FFE66D] focus:outline-none focus:border-[#FFE66D] focus:shadow-[0_0_10px_#FFE66D]"
                  style={{ fontFamily: '"Press Start 2P", cursive' }}
                />
              </div>

              <div>
                <label className="block text-sm mb-2">MESSAGE:</label>
                <textarea
                  rows={4}
                  className="w-full bg-black border-2 border-[#FFE66D] p-3 text-[#FFE66D] focus:outline-none focus:border-[#FFE66D] focus:shadow-[0_0_10px_#FFE66D] resize-none"
                  style={{ fontFamily: '"Press Start 2P", cursive' }}
                />
              </div>

              <button
                type="submit"
                className="w-full px-6 py-4 border-4 border-[#FFE66D] bg-black text-[#FFE66D] hover:bg-[#FFE66D] hover:text-black transition-all text-sm"
                style={{ fontFamily: '"Press Start 2P", cursive' }}
              >
                SEND MESSAGE
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;

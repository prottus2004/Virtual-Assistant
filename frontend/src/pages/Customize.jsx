import React, { useContext, useRef, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import image1 from "../assets/image1.png";
import image2 from "../assets/image2.jpg";
import image3 from "../assets/authBg.png";
import image4 from "../assets/image4.png";
import image5 from "../assets/image5.png";
import image6 from "../assets/image6.jpeg";
import image7 from "../assets/image7.jpeg";
import { RiImageAddLine } from "react-icons/ri";
import { MdKeyboardBackspace, MdChevronLeft, MdChevronRight } from "react-icons/md";
import { userDataContext } from '../context/UserContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const wrap = (min, max, v) => {
  const rangeSize = max - min;
  return ((((v - min) % rangeSize) + rangeSize) % rangeSize) + min;
};

const variants = {
  enter: (direction) => ({
    x: direction > 0 ? 500 : -500,
    opacity: 0,
  }),
  center: {
    zIndex: 1,
    x: 0,
    opacity: 1,
  },
  exit: (direction) => ({
    zIndex: 0,
    x: direction < 0 ? 500 : -500,
    opacity: 0,
  }),
};

function Customize() {
  const { 
    userData,
    setUserData, 
    serverUrl,
    setBackendImage, 
    frontendImage, 
    setFrontendImage, 
    selectedImage, 
    setSelectedImage 
  } = useContext(userDataContext);

  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const inputImage = useRef();
  const [[page, direction], setPage] = useState([0, 0]);

  const allChoices = [
    { id: 'image7', name: "OPTIMUS", image: image7 },
    { id: 'image2', name: "SIFRA", image: image2 },
    { id: 'image1', name: "AURA", image: image1 },
    { id: 'image5', name: "NOVA", image: image5 },
    { id: 'image4', name: "MAYA", image: image4 },
    { id: 'image6', name: "KAI", image: image6 },
    { id: 'image3', name: "SARA", image: image3 },
    { id: 'upload', name: "Upload Your Own", image: null, isUpload: true },
  ];

  const choiceIndex = wrap(0, allChoices.length, page);
  const currentChoice = allChoices[choiceIndex];

  // 🐞 BUG FIX: This useEffect now syncs the state on initial load and every change.
  useEffect(() => {
    const currentChoice = allChoices[choiceIndex];
    if (currentChoice.isUpload) {
      setSelectedImage("input");
      setUserData(prev => ({ ...prev, assistantName: "" }));
    } else {
      setSelectedImage(currentChoice.image);
      setUserData(prev => ({ ...prev, assistantName: currentChoice.name }));
      setFrontendImage(null);
      setBackendImage(null);
    }
  }, [choiceIndex]); // Runs whenever the index changes.

  const paginate = (newDirection) => {
    setPage([page + newDirection, newDirection]);
  };
  
  const handleImage = (e) => {
    const file = e.target.files[0];
    if (file) {
      setBackendImage(file);
      setFrontendImage(URL.createObjectURL(file));
    }
  };

  const handleFinalizeAssistant = async () => {
    // This guard clause will now work correctly because the state is initialized.
    if (!userData?.assistantName || !selectedImage || selectedImage === "input") {
      console.error("Attempted to finalize without a selected assistant.");
      return;
    }
    setLoading(true);
    try {
        const formData = new FormData();
        formData.append("assistantName", userData.assistantName);
        formData.append("imageUrl", selectedImage);
        const result = await axios.post(`${serverUrl}/api/user/update`, formData, { withCredentials: true });
        setUserData(result.data);
        navigate("/");
    } catch (error) {
        console.error("Failed to update assistant:", error);
        setLoading(false);
    }
  };

  const handleNextClick = () => {
    if (selectedImage === "input") {
        navigate("/customize2");
    } else {
        handleFinalizeAssistant();
    }
  };

  return (
    <div className='w-full min-h-screen bg-gradient-to-t from-[black] to-[#030353] flex flex-col justify-between p-5 overflow-hidden'>
      <header className='w-full flex items-center'>
        <MdKeyboardBackspace className='absolute top-8 left-8 text-white cursor-pointer w-7 h-7 z-20' onClick={() => navigate("/")} />
        <h1 className='text-white text-3xl text-center w-full mt-4'>Select your <span className='text-blue-200'>Assistant</span></h1>
      </header>

      <main className='relative flex-grow flex items-center justify-center w-full'>
        <AnimatePresence initial={false} custom={direction} mode="wait">
          <motion.div
            key={page}
            custom={direction}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{
              x: { type: "spring", stiffness: 300, damping: 30 },
              opacity: { duration: 0.2 },
            }}
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.2}
            onDragEnd={(e, { offset, velocity }) => {
              const swipe = Math.abs(offset.x) * velocity.x;
              if (swipe < -10000) { paginate(1); } 
              else if (swipe > 10000) { paginate(-1); }
            }}
            className='absolute w-[350px] h-[550px] flex flex-col items-center justify-center'
          >
            {currentChoice.isUpload ? (
              <div onClick={() => inputImage.current.click()} className='w-[300px] h-[450px] bg-[#020220]/50 border-2 border-dashed border-[#0000ff66] rounded-2xl flex items-center justify-center cursor-pointer hover:bg-[#020220] transition-colors'>
                {frontendImage ? <img src={frontendImage} alt="Uploaded preview" className='w-full h-full object-cover rounded-2xl'/> : <RiImageAddLine className='text-white w-12 h-12'/>}
              </div>
            ) : (
              <img src={currentChoice.image} alt={currentChoice.name} className='max-w-[350px] max-h-[450px] object-contain drop-shadow-2xl'/>
            )}
            <h2 className='text-white text-4xl font-bold mt-6 tracking-widest uppercase'>
              {currentChoice.name}
            </h2>
          </motion.div>
        </AnimatePresence>
        
        <button onClick={() => paginate(-1)} className='absolute left-5 md:left-20 z-10 p-2 rounded-full hover:bg-white/10 transition-colors'>
            <MdChevronLeft size={60} className='text-white' />
        </button>
        <button onClick={() => paginate(1)} className='absolute right-5 md:right-20 z-10 p-2 rounded-full hover:bg-white/10 transition-colors'>
            <MdChevronRight size={60} className='text-white' />
        </button>
      </main>

      <footer className='w-full flex justify-center items-center pb-5'>
        <button className='min-w-[200px] h-[60px] text-black font-semibold cursor-pointer bg-white rounded-full text-[19px] transition-transform hover:scale-105' onClick={handleNextClick} disabled={loading}>
          {loading ? "Saving..." : (selectedImage === "input" ? "Next" : "Start Chatting")}
        </button>
      </footer>
      
      <input type="file" accept='image/*' ref={inputImage} hidden onChange={handleImage} />
    </div>
  );
}

export default Customize;
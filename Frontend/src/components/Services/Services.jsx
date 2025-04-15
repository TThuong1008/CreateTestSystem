import React from "react";
import { CiMobile3 } from "react-icons/ci";
import { TbWorldWww } from "react-icons/tb";
import { IoMdHappy } from "react-icons/io";
import { BiSupport } from "react-icons/bi";
import { IoPulseOutline } from "react-icons/io5";
import { motion } from "framer-motion";

const ServicesData = [
  {
    id: 1,
    title: "Create Test",
    link: "#",
    icon: <TbWorldWww />,
    delay: 0.2,
  },
  {
    id: 2,
    title: "Take Test",
    link: "#",
    icon: <CiMobile3 />,
    delay: 0.3,
  },
  {
    id: 3,
    title: "Satisfied Clients",
    link: "#",
    icon: <IoMdHappy />,
    delay: 0.4,
  },
  {
    id: 4,
    title: "SEO Optimization",
    link: "#",
    icon: <IoPulseOutline />,
    delay: 0.5,
  },
  {
    id: 5,
    title: "24/7 Support",
    link: "#",
    icon: <BiSupport />,
    delay: 0.6,
  },
];

const SlideLeft = (delay) => ({
  initial: { opacity: 0, x: 50 },
  animate: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.3, delay, ease: "easeInOut" },
  },
});

const Services = () => {
  return (
    <section className="bg-white">
      <div className="container pb-14 pt-16">
        <h1 className="text-4xl font-bold text-center pb-10">
          Services we provide
        </h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6 justify-center">
          {ServicesData.map((service) => (
            <motion.div
              key={service.id}
              variants={SlideLeft(service.delay)}
              initial="initial"
              whileInView="animate"
              viewport={{ once: true }}
              className="bg-[#f4f4f4] rounded-2xl flex flex-col gap-4 items-center justify-center p-6 hover:bg-white hover:scale-105 transition duration-300 hover:shadow-xl"
            >
              <div className="text-5xl text-secondary">{service.icon}</div>
              <h1 className="text-lg font-semibold text-center">
                {service.title}
              </h1>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Services;
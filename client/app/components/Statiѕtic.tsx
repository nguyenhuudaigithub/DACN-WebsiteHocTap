"use client";
import React, { useEffect, useState } from 'react';
import dynamic from "next/dynamic";

const achievementsList = [
  {
    metric: "Bài Học",
    value: 100,
    postfix: "+",
  },
  {
    prefix: "~",
    metric: "Người Dùng",
    value: 100000,
  },
  {
    metric: "Lượt Mua",
    value: 120000,
  },
  {
    metric: "Năm",
    value: 5,
  },
];

function AnimatedAchievements() {
  const [animatedValues, setAnimatedValues] = useState<number[]>(Array(achievementsList.length).fill(0));

  useEffect(() => {
    const animationDuration = 2000; 
    const frameDuration = 1000 / 60;
    const totalFrames = Math.ceil(animationDuration / frameDuration);

    const updateValue = (index: number, valueToReach: number, frame: number) => {
      const step = valueToReach / totalFrames;
      const nextValue = Math.min((frame + 1) * step, valueToReach);
      setAnimatedValues((prevValues) => {
        const newValues = [...prevValues];
        newValues[index] = nextValue;
        return newValues;
      });

      if (frame < totalFrames - 1) {
        requestAnimationFrame(() => updateValue(index, valueToReach, frame + 1));
      }
    };

    achievementsList.forEach((achievement, index) => {
      updateValue(index, achievement.value, 0);
    });
  }, []);

  return (
    <div className="py-8 px-4 xl:gap-16 sm:py-16 xl:px-16">
        <div className="sm:border-[#33353F]  dark:text-white text-black sm:border rounded-md py-8 px-16 flex flex-col sm:flex-row items-center justify-between">
      {achievementsList.map((achievement, index) => (
        <div
          key={index}
          className="flex flex-col items-center justify-center mx-4 my-4 sm:my-0"
        >
          <h2 className="text-4xl font-bold flex flex-row dark:text-white text-black">
            {achievement.prefix}
            <span className=" text-4xl font-bold dark:text-white text-black">{Math.floor(animatedValues[index])}</span>
            {achievement.postfix}
          </h2>
          <p className=" text-base dark:text-white text-black">{achievement.metric}</p>
        </div>
      ))}
      </div>
    </div>
  );
}

export default AnimatedAchievements;
'use client'; // Only required if using in Next.js /app directory

import { useCallback, useEffect, useState } from "react";
import styled from "styled-components";
import { CgChevronDoubleUp } from "react-icons/cg";

const ScrollToTopButton = () => {
  const [visible, setVisible] = useState(false);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const listenToScroll = useCallback(() => {
    const heightToShow = 250;
    const winScroll = document.documentElement.scrollTop || document.body.scrollTop;
    setVisible(winScroll > heightToShow);
  }, []);

  useEffect(() => {
    window.addEventListener("scroll", listenToScroll);
    return () => window.removeEventListener("scroll", listenToScroll);
  }, [listenToScroll]);

  return (
    <>
      {visible && (
        <Wrapper>
          <div className="top-btn" onClick={scrollToTop}>
            <CgChevronDoubleUp className="up-icon" />
          </div>
        </Wrapper>
      )}
    </>
  );
};

export default ScrollToTopButton;

const Wrapper = styled.div`
  .top-btn {
    position: fixed;
    display: flex;
    justify-content: center;
    align-items: center;
    width: 50px;
    height: 50px;
    bottom: 2rem;
    right: 2rem;
    cursor: pointer;
    padding: 0.25rem;
    z-index: 999;
    border-radius: 50%;
    box-shadow: 0px 0px 24px rgba(0, 0, 0, 0.2);
    background-color: gray;

    .up-icon {
      font-size: 1.5rem;
      color: white;
      transition: transform 0.3s ease;
      &:hover {
        transform: translateY(-2px);
      }
    }
  }

  @media (max-width: 700px) {
    .top-btn {
      width: 40px;
      height: 40px;
      bottom: 5rem;
      right: 1rem;
    }
  }
`;

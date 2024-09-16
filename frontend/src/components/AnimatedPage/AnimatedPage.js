import React, { useEffect } from 'react';
import './AnimatedPage.css';

const AnimatedPage = ({ children }) => {
    useEffect(() => {
        const container = document.querySelector('.page-container');
        container.classList.add('fade-in');
    }, []);

    return <div className="page-container">{children}</div>;
};

export default AnimatedPage;

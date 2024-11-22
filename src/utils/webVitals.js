import { getCLS, getFID, getLCP, getTTFB } from 'web-vitals';

export const webVitals = ({ debug = false }) => {
    const sendToAnalytics = ({ name, delta, id }) => {
        if (window.gtag) {
            window.gtag('event', name, {
                event_category: 'Web Vitals',
                event_label: id,
                value: Math.round(name === 'CLS' ? delta * 1000 : delta),
                non_interaction: true,
            });
        }
        if (debug) {
            console.log(`Web Vitals: ${name}`, delta, id);
        }
    };

    getCLS(sendToAnalytics);
    getFID(sendToAnalytics);
    getLCP(sendToAnalytics);
    getTTFB(sendToAnalytics);
}; 
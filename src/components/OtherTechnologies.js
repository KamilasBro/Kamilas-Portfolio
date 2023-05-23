import { useInView } from 'react-intersection-observer';
export default function OtherTechnologies() {
    const {ref, inView}=useInView({
        triggerOnce: true
    })
    return (
        <section className="other-technologies" ref={ref}>
            <h1 className="section-title"
            style={inView===true?{animation:"titleAnim 1s"}:{}}>Additional technologies I use</h1>
            <ul className="other-technologies-list">
                <li style={inView===true?{animation:"otherTechAnim1 1.1s"}:{}}><div className="bullet"/>Git</li>
                <li style={inView===true?{animation:"otherTechAnim1 1.2s"}:{}}><div className="bullet"/>Figma</li>
                <li style={inView===true?{animation:"otherTechAnim1 1.3s"}:{}}><div className="bullet"/>Wordpress</li>
            </ul>
        </section>
    )
  }
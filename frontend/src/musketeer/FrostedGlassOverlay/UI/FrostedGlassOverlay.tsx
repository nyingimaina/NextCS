import React, { Component, ReactNode } from 'react';
import styles from "../Styles/Overlay.module.css"

interface OverlayProps {
  show: boolean;
  children: ReactNode
  description?: string;
}

class FrostedGlassOverlay extends Component<OverlayProps> {
  render() {
    const { show, children, description } = this.props;

    return (
      <>
        {show && (
          <div className={styles.overlay}>
            <div className={styles.progressBar}></div>
            <div className={styles.descriptiveText}>
                {description}
            </div>
          </div>
        )}
        {children}
      </>
    );
  }
}

export default FrostedGlassOverlay;

import { PureComponent } from "react";
import { motion } from "framer-motion";
import { BiSolidLeftArrow, BiSolidRightArrow } from "react-icons/bi";
import styles from "../Styles/Stepper.module.css";

interface IProps<T> {
  stepNames: T[];
  currentStep: number;
  onStepClick?: (index: number) => void;
  onPrevClick?: () => void;
  onNextClick?: () => void;
}

interface IState {
  shouldAnimateOnMount: boolean;
  bounceStepIndex: number | null;
}

export default class Stepper<T> extends PureComponent<IProps<T>, IState> {
  state: IState = {
    shouldAnimateOnMount: false,
    bounceStepIndex: null,
  };

  componentDidMount() {
    if (document.readyState === "complete") {
      this.setState({ shouldAnimateOnMount: true });
    } else {
      window.addEventListener("load", () => {
        this.setState({ shouldAnimateOnMount: true });
      });
    }
  }

  componentDidUpdate(prevProps: IProps<T>) {
    if (prevProps.currentStep !== this.props.currentStep) {
      this.setState({ bounceStepIndex: this.props.currentStep });

      setTimeout(() => {
        this.setState({ bounceStepIndex: null });
      }, 400);
    }
  }

  render() {
    const { stepNames, currentStep, onPrevClick, onNextClick } = this.props;
    const { shouldAnimateOnMount, bounceStepIndex } = this.state;

    return (
      <div className={styles.stepperWrapper}>
        {onPrevClick && (
          <button
            className={`${styles.navButtonLeft} ${styles.navArrow}`}
            onClick={onPrevClick}
            aria-label="Previous step"
          >
            <BiSolidLeftArrow />
          </button>
        )}

        <div className={styles.scrollContainer}>
          <div className={styles.stepperContainer} role="list">
            {stepNames.map((name, index) => {
              const isCompleted = index < currentStep;
              const isActive = index === currentStep;
              const shouldBounce = bounceStepIndex === index;

              return (
                <div
                  className={styles.stepItem}
                  key={index}
                  onClick={() => this.props.onStepClick?.(index)}
                  role="listitem"
                  aria-current={isActive ? "step" : undefined}
                >
                  <motion.div
                    className={`${styles.circle} ${
                      isCompleted
                        ? styles.completed
                        : isActive
                        ? styles.active
                        : styles.inactive
                    }`}
                    initial={
                      shouldAnimateOnMount ? { scale: 0.8, opacity: 0 } : false
                    }
                    animate={
                      shouldBounce
                        ? {
                            scale: [1, 1.25, 0.95, 1],
                            transition: { duration: 0.4, ease: "easeOut" },
                          }
                        : { scale: 1, opacity: 1 }
                    }
                    transition={{
                      duration: 0.3,
                      ease: "easeOut",
                      delay: index * 0.05,
                    }}
                  >
                    <span className={styles.circleInner}>{index + 1}</span>
                  </motion.div>

                  <div className={styles.label}>{name + ""}</div>

                  {index !== stepNames.length - 1 && (
                    <div className={styles.connector} />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {onNextClick && (
          <button
            className={`${styles.navButtonRight} ${styles.navArrow}`}
            onClick={onNextClick}
            aria-label="Next step"
          >
            <BiSolidRightArrow />
          </button>
        )}
      </div>
    );
  }
}

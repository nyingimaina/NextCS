import React, {
  useState,
  useRef,
  useEffect,
  ReactNode,
  useLayoutEffect,
  useCallback,
} from "react";
import ReactDOM from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import styles from "../Styles/OverflowMenu.module.css";
import IOverflowMenuItem from "../Data/IOverflowMenuItem";

interface IProps {
  icon?: ReactNode;
  portal?: HTMLElement;
  className?: string;
  items: IOverflowMenuItem[];
}

const OverflowMenu: React.FC<IProps> = ({
  icon = "⋮",
  portal,
  className,
  items,
}) => {
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const [menuPos, setMenuPos] = useState<{ top: number; left: number }>({
    top: 0,
    left: 0,
  });

  const updatePosition = useCallback(() => {
    if (triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      setMenuPos({
        top: rect.bottom + window.scrollY + 4, // add some spacing
        left: rect.right + window.scrollX - 160, // assuming menu width ~160px
      });
    }
  }, []);

  useLayoutEffect(() => {
    if (open) updatePosition();
  }, [open, updatePosition]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        triggerRef.current &&
        !triggerRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const menuContent = (
    <AnimatePresence>
      {open && (
        <motion.div
          className={styles.menu}
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
          style={{ position: "absolute", top: menuPos.top, left: menuPos.left }}
        >
          {items.map((item, index) => (
            <button
              key={index}
              onClick={() => {
                if (item.onClick) item.onClick();
              }}
            >
              {item.content}
            </button>
          ))}
        </motion.div>
      )}
    </AnimatePresence>
  );

  return (
    <>
      <button
        ref={triggerRef}
        className={`${styles.trigger} ${className}`}
        onClick={() => setOpen(!open)}
      >
        {icon}
      </button>
      {portal ? ReactDOM.createPortal(menuContent, portal) : menuContent}
    </>
  );
};

export default OverflowMenu;

import { motion, AnimatePresence } from "framer-motion";
import { X, Link, MessageCircle, MoreHorizontal } from "lucide-react";
import { Button } from "./button";

interface ShareDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ShareDrawer({ isOpen, onClose }: ShareDrawerProps) {
  const shareOptions = [
    { icon: <MessageCircle className="h-6 w-6" />, label: "微信", color: "bg-green-500" },
    { icon: <div className="h-6 w-6 bg-white rounded-full flex items-center justify-center font-bold text-black">朋友圈</div>, label: "朋友圈", color: "bg-gray-400" },
    { icon: <Link className="h-6 w-6" />, label: "复制链接", color: "bg-blue-500" },
    { icon: <MoreHorizontal className="h-6 w-6" />, label: "更多", color: "bg-gray-100 text-gray-800" },
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.5 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black z-50"
          />
          
          {/* Drawer */}
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed bottom-0 left-0 right-0 bg-background z-50 rounded-t-xl p-6 pb-8"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-semibold text-lg">分享至</h3>
              <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8 rounded-full">
                <X className="h-4 w-4" />
              </Button>
            </div>

            <div className="grid grid-cols-4 gap-4 mb-6">
              {shareOptions.map((option, index) => (
                <div key={index} className="flex flex-col items-center gap-2 cursor-pointer">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white ${option.color}`}>
                    {option.icon}
                  </div>
                  <span className="text-xs text-muted-foreground">{option.label}</span>
                </div>
              ))}
            </div>

            <div className="border-t pt-4">
              <Button variant="outline" className="w-full rounded-full" onClick={onClose}>
                取消
              </Button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

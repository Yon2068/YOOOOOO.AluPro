import { useNavigate } from "react-router-dom";
import { ArrowLeft, Clock, Trash2, Loader2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { useAppSelector } from "@/store";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

type HistoryItem = {
  id: string;
  targetId: string;
  title: string;
  cover: string;
  author: string;
  time: string;
  dateGroup: string; // e.g., "Today", "Yesterday", "2023-10-25"
  type: "model" | "article" | "video";
};

type HistoryGroup = {
  date: string;
  items: HistoryItem[];
};

export default function History() {
  const navigate = useNavigate();
  const { token } = useAppSelector((state) => state.auth);
  const [groups, setGroups] = useState<HistoryGroup[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        setIsLoading(true);
        const headers: HeadersInit = {};
        if (token) {
          headers["Authorization"] = `Bearer ${token}`;
        }

        const response = await fetch(`${API_BASE_URL}/users/me/history`, {
          headers
        });
        
        if (!response.ok) {
          throw new Error("Failed to fetch history");
        }

        const json = await response.json();
        // API returns grouped data: [{ date: "...", items: [...] }]
        const rawGroups = Array.isArray(json) ? json : (json.data || json.items || []);
        
        const processedGroups: HistoryGroup[] = rawGroups.map((group: any) => ({
          date: group.date,
          items: (group.items || []).map((item: any) => {
             // Determine type
             let type: "model" | "article" | "video" = "model";
             const rawType = String(item.type || item.itemType || "model").toLowerCase();
             if (rawType.includes("article")) type = "article";
             else if (rawType.includes("video")) type = "video";

             // ID cleaning
             let targetId = item.targetId || item.modelId || item.contentId || item.id;
             if (targetId && typeof targetId === 'string') {
                const uuidMatch = targetId.match(/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i);
                if (uuidMatch) targetId = uuidMatch[0];
             }

             return {
               id: item.id, // Keep original ID for key
               targetId: targetId,
               title: item.title || "未命名",
               cover: item.cover || "",
               author: item.author || "Unknown",
               time: item.time || "Unknown",
               dateGroup: group.date,
               type: type
             };
          })
        }));

        setGroups(processedGroups);
      } catch (err) {
        console.error("Error fetching history:", err);
        setError("无法加载浏览记录");
      } finally {
        setIsLoading(false);
      }
    };

    fetchHistory();
  }, [token]);

  const handleClearHistory = async () => {
     try {
       setIsDeleting(true);
       const headers: HeadersInit = {};
       if (token) {
         headers["Authorization"] = `Bearer ${token}`;
       }
       
       const response = await fetch(`${API_BASE_URL}/users/me/history`, {
         method: "DELETE",
         headers
       });

       if (!response.ok) {
         throw new Error("Failed to clear history");
       }

       setGroups([]);
       setShowDeleteConfirm(false);
     } catch (err) {
       console.error("Error clearing history:", err);
       // We could show a toast here if we had a toast component
     } finally {
       setIsDeleting(false);
     }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border/50">
        <div className="container mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate(-1)} className="-ml-2 hover:bg-secondary/50 rounded-full">
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="font-semibold text-lg">浏览足迹</h1>
          </div>
          <Button 
            variant="ghost" 
            size="icon" 
            className="text-muted-foreground hover:text-red-500 hover:bg-red-50 rounded-full"
            onClick={() => setShowDeleteConfirm(true)}
            disabled={groups.length === 0 || isLoading}
          >
            <Trash2 className="h-5 w-5" />
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 container mx-auto px-4 py-6">
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : error ? (
          <div className="text-center py-20 text-muted-foreground">
            {error}
            <Button variant="link" onClick={() => window.location.reload()} className="block mx-auto mt-2">
              重试
            </Button>
          </div>
        ) : groups.length === 0 ? (
          <div className="text-center py-20 text-muted-foreground">
            暂无浏览记录
          </div>
        ) : (
          <div className="space-y-8">
            {groups.map((group) => (
              <div key={group.date} className="space-y-4">
                <h2 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary/50"></span>
                  {group.date}
                </h2>
                
                <div className="grid gap-4">
                  {group.items.map((item) => (
                    <div 
                      key={item.id}
                      className="flex gap-4 p-3 rounded-xl bg-card border border-border/30 hover:bg-secondary/30 transition-colors cursor-pointer"
                      onClick={() => {
                        if (item.type === "model") navigate(`/models/${item.targetId}`);
                        else if (item.type === "video") navigate(`/content/video/${item.targetId}`);
                        else navigate(`/content/article/${item.targetId}`);
                      }}
                    >
                      <div className="w-20 h-14 shrink-0 rounded-md bg-muted overflow-hidden border border-border/30">
                        <img 
                          src={item.cover} 
                          alt={item.title} 
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0 flex flex-col justify-between py-0.5">
                        <h3 className="font-medium text-sm truncate">{item.title}</h3>
                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                          <span 
                            className="cursor-pointer hover:text-foreground hover:underline transition-colors"
                            onClick={(e) => {
                              e.stopPropagation();
                              // navigate("/author/1"); // TODO: Add author ID
                            }}
                          >
                            {item.author}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {item.time}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-card w-full max-w-sm rounded-xl border shadow-lg p-6 space-y-4 animate-in zoom-in-95 duration-200">
            <div className="flex flex-col items-center text-center gap-2">
              <div className="p-3 bg-red-100 dark:bg-red-900/30 rounded-full">
                <AlertCircle className="h-6 w-6 text-red-600 dark:text-red-500" />
              </div>
              <h3 className="font-semibold text-lg">清空浏览记录</h3>
              <p className="text-sm text-muted-foreground">
                确定要清空所有浏览记录吗？此操作无法撤销。
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Button 
                variant="outline" 
                className="flex-1" 
                onClick={() => setShowDeleteConfirm(false)}
                disabled={isDeleting}
              >
                取消
              </Button>
              <Button 
                variant="destructive" 
                className="flex-1 bg-red-600 hover:bg-red-700" 
                onClick={handleClearHistory}
                disabled={isDeleting}
              >
                {isDeleting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    清空...
                  </>
                ) : (
                  "确认清空"
                )}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

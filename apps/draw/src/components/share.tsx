import { Button } from "./ui/button";
import { useDrawStore } from "@/draw-store";
import { Input } from "./ui/input";
import { UserColors } from "@/collab";

interface ShareProps {
  handleShare: () => void;
  handleShareStop: () => void;
  handleShareIdentityUpdate: () => void;
}

export function Share({
  handleShare,
  handleShareStop,
  handleShareIdentityUpdate,
}: ShareProps) {
  const { shareRoomId, shareIdentity, setShareIdentity } = useDrawStore();
  const updateIdentity = () => {
    const color = UserColors[Math.round(Math.random() * UserColors.length - 1)];
    setShareIdentity({
      ...shareIdentity,
      color,
      name: shareIdentity?.name || "",
    });
    handleShareIdentityUpdate();
  };
  return (
    <div className="flex justify-center items-center h-8 px-1">
      {shareIdentity && (
        <Input
          className="h-8 rounded-md px-3 text-xs mr-1"
          style={{ color: shareIdentity.color }}
          value={shareIdentity.name}
          onChange={(e) =>
            setShareIdentity({ ...shareIdentity, name: e.target.value })
          }
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              updateIdentity();
            }
          }}
          spellCheck={false}
        />
      )}
      {shareRoomId ? (
        <Button onClick={handleShareStop} size="sm" variant="outline">
          Stop
        </Button>
      ) : (
        <Button onClick={handleShare} size="sm" variant="outline">
          Share
        </Button>
      )}
    </div>
  );
}

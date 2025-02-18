import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useDrawStore } from "@/draw-store";
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
  const { hasCollab, shareRoomId, shareIdentity, setShareIdentity } =
    useDrawStore();
  const updateIdentity = () => {
    const color = UserColors[Math.round(Math.random() * UserColors.length - 1)];
    setShareIdentity({
      ...shareIdentity,
      color,
      name: shareIdentity?.name || "",
    });
    handleShareIdentityUpdate();
  };

  if (hasCollab === null) {
    return <div></div>;
  }

  if (hasCollab === false) {
    return (
      <div className="flex justify-center items-center h-8 px-1">
        <Input
          className="h-8 rounded-md px-3 text-xs text-red-500 w-[272px]"
          value="Collaboration is not available on Github Pages."
          readOnly
        />
      </div>
    );
  }

  return (
    <div className="flex justify-center items-center h-8 px-1">
      {shareRoomId && shareIdentity && (
        <>
          <Input
            className="h-8 rounded-md px-3 text-xs mr-1"
            style={{ color: shareIdentity.color }}
            value={shareIdentity.name}
            onChange={(e) =>
              setShareIdentity({ ...shareIdentity, name: e.target.value })
            }
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.currentTarget.blur();
              }
            }}
            onBlur={updateIdentity}
            spellCheck={false}
          />
          <Button
            onClick={updateIdentity}
            size="sm"
            className="mr-1"
            variant="outline"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              className="w-4 h-4"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </Button>
        </>
      )}
      {shareRoomId ? (
        <Button
          onClick={handleShareStop}
          size="sm"
          variant="destructive"
          title="Stop Collaboration"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            className="w-4 h-4"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </Button>
      ) : (
        <Button
          onClick={handleShare}
          size="sm"
          variant="outline"
          title="Start Collaboration"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            className="w-4 h-4"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 10l4.553-4.553a1.5 1.5 0 00-2.121-2.121L12.879 7.879a1.5 1.5 0 01-2.121 0L6.553 3.326a1.5 1.5 0 00-2.121 2.121L9 10m6 4l4.553 4.553a1.5 1.5 0 01-2.121 2.121L12.879 16.121a1.5 1.5 0 00-2.121 0L6.553 20.674a1.5 1.5 0 01-2.121-2.121L9 14"
            />
          </svg>
        </Button>
      )}
    </div>
  );
}

import { Menus } from "./menus";
import { Options } from "./options";
import { Share } from "./share";

interface TopBarProps {
  handleShare: () => void;
  handleShareStop: () => void;
  handleShareIdentityUpdate: () => void;
}

export function TopBar({
  handleShare,
  handleShareStop,
  handleShareIdentityUpdate,
}: TopBarProps) {
  return (
    <div className="absolute top-2 left-1/2 transform -translate-x-1/2 h-10 w-[800px] border rounded-lg flex items-center justify-between bg-background">
      <Menus />
      <Options />
      <Share
        handleShare={handleShare}
        handleShareStop={handleShareStop}
        handleShareIdentityUpdate={handleShareIdentityUpdate}
      />
    </div>
  );
}

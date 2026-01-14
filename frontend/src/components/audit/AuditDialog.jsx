import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import AuditTimeline from "./AuditTimeLine";

export default function AuditDialog({ open, onClose, passwordId, site }) {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="glass max-w-md">
        <DialogHeader>
          <DialogTitle>Activity — {site}</DialogTitle>
        </DialogHeader>

        <AuditTimeline passwordId={passwordId} />
      </DialogContent>
    </Dialog>
  );
}

/**
 * Device Linking Modal
 *
 * Modal wrapper for the device linking flow on an existing device.
 * Shows QR code generation and handles approval dialog when a new device scans.
 *
 * @module components/sync/linking-modal
 */

import { useState, useCallback } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog'
import { QRLinking } from './qr-linking'
import { LinkingApprovalDialog } from './linking-approval-dialog'
import { useApproveLinking, useRejectLinking, useLinkingEvents } from '@/hooks/use-device-linking'

// =============================================================================
// Types
// =============================================================================

interface LinkingModalProps {
  /** Whether the modal is open */
  isOpen: boolean
  /** Callback when the modal is closed */
  onClose: () => void
}

interface LinkingRequestData {
  sessionId: string
  deviceName: string
  devicePlatform: string
  newDevicePublicKey: string
  newDeviceConfirm: string
}

// =============================================================================
// Component
// =============================================================================

export function LinkingModal({ isOpen, onClose }: LinkingModalProps) {
  const [linkingRequest, setLinkingRequest] = useState<LinkingRequestData | null>(null)
  const [approvalError, setApprovalError] = useState<string | null>(null)

  const approveLinking = useApproveLinking()
  const rejectLinking = useRejectLinking()

  // Subscribe to linking request events
  useLinkingEvents({
    onLinkingRequest: (event) => {
      setLinkingRequest(event)
    }
  })

  // Handle approve
  const handleApprove = useCallback(async (input: {
    sessionId: string
    newDevicePublicKey: string
    newDeviceConfirm: string
  }) => {
    setApprovalError(null)

    try {
      const result = await approveLinking.mutateAsync({
        sessionId: input.sessionId,
        newDevicePublicKey: input.newDevicePublicKey,
        newDeviceConfirm: input.newDeviceConfirm
      })

      if (!result.success) {
        setApprovalError(result.error || 'Failed to approve linking')
        return
      }

      // Success - close everything
      setLinkingRequest(null)
      onClose()
    } catch (err) {
      setApprovalError(err instanceof Error ? err.message : 'Failed to approve linking')
    }
  }, [approveLinking, onClose])

  // Handle reject
  const handleReject = useCallback(async () => {
    if (!linkingRequest) return

    try {
      await rejectLinking.mutateAsync({ sessionId: linkingRequest.sessionId })
    } catch (err) {
      // Ignore reject errors
    }

    setLinkingRequest(null)
  }, [linkingRequest, rejectLinking])

  // Handle close - also resets state
  const handleClose = useCallback(() => {
    setLinkingRequest(null)
    setApprovalError(null)
    onClose()
  }, [onClose])

  // Handle linking request callback from QRLinking
  const handleLinkingRequest = useCallback((_event: {
    sessionId: string
    deviceName: string
    devicePlatform: string
  }) => {
    // This is called when QRLinking receives the event
    // The useLinkingEvents hook above will also receive it
    // No need to duplicate - the hook handles it
  }, [])

  // If there's a pending linking request, show the approval dialog
  if (linkingRequest) {
    return (
      <LinkingApprovalDialog
        isOpen={true}
        onOpenChange={(open) => {
          if (!open) {
            handleReject()
          }
        }}
        sessionId={linkingRequest.sessionId}
        deviceName={linkingRequest.deviceName}
        devicePlatform={linkingRequest.devicePlatform}
        newDevicePublicKey={linkingRequest.newDevicePublicKey}
        newDeviceConfirm={linkingRequest.newDeviceConfirm}
        onApprove={handleApprove}
        onReject={handleReject}
        isApproving={approveLinking.isPending}
        error={approvalError}
      />
    )
  }

  // Otherwise show the QR code generation modal
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader className="sr-only">
          <DialogTitle>Link a New Device</DialogTitle>
        </DialogHeader>
        <QRLinking
          onCancel={handleClose}
          onLinkingRequest={handleLinkingRequest}
        />
      </DialogContent>
    </Dialog>
  )
}

export default LinkingModal

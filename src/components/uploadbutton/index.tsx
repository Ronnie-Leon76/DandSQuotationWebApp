import React, { useState } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import LoadingDialog from '../loader/loadingSpinner';
import { File } from 'lucide-react';

const UploadFile = () => {
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    return (
        <div className="w-full">
          <LoadingDialog open={loading} />
          <Dialog open={open} onOpenChange={setOpen} modal>
            <DialogTrigger asChild>
              <Button>
                <File  />
                Request a Quotation <span className="ml-2"></span>
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[800px] sm:min-w-[600px] sm:min-h-[400px]">
              <DialogHeader className="mb-1">
                <DialogTitle>Quotation Information</DialogTitle>
                <DialogDescription>
                  Make changes to your quotation request. Click save when
                  you&apos;re done.
                </DialogDescription>
                
              </DialogHeader>
              <DialogFooter>
               
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      );
}

export default UploadFile
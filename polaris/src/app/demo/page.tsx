"use client"

import { Button } from "@/components/ui/button"
import { se } from "date-fns/locale";
import { useState } from "react";

export default function DemoPage() {
    const [loading, setLoading] = useState(false);
    const [loadingBackground, setLoadingBackground] = useState(false);

    const handleBlocking = async () => {
        setLoading(true);
        await fetch('/api/demo/blocking', {
            method: 'POST',
        })
        setLoading(false);
    }

    const handleBackground = async () => {
        setLoadingBackground(true);
        await fetch('/api/demo/background', {
            method: 'POST',
        })
        setLoadingBackground(false);
    }

    return (
        <div className="p-8 space-x-4">
            <Button disabled={loading} onClick={handleBlocking}>
                {loading ? 'Loading...' : 'Blocking'}
            </Button>

            <Button disabled={loadingBackground} onClick={handleBackground}>
                {loadingBackground ? 'Loading...' : 'Background'}
            </Button>
        </div>
    )
}
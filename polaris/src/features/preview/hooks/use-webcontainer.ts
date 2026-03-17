// Singleton Webcontainer instance

import { WebContainer } from "@webcontainer/api";
import { Id } from "../../../../convex/_generated/dataModel";
import { useCallback, useEffect, useRef, useState } from "react";
import { useFiles } from "@/features/projects/hooks/use-files";
import { buildFileTree, getFilePath } from "../utils/file-tree";

let webcontainerInstance: WebContainer | null = null;
let bootPromise: Promise<WebContainer> | null = null;

const getWebcontaier = async (): Promise<WebContainer> => {
    if (webcontainerInstance) {
        return webcontainerInstance;
    }

    if (!bootPromise) {
        bootPromise = WebContainer.boot({ coep: 'credentialless' });
    }

    webcontainerInstance = await bootPromise;

    return webcontainerInstance;
};

const teardownWebcontainer = () => {
    if (webcontainerInstance) {
        webcontainerInstance.teardown();
        webcontainerInstance = null;
    }

    bootPromise = null;
};

interface UseWebcontainersProps {
    projectId: Id<'projects'>;
    enabled: boolean;
    settings?: {
        installCommand?: string;
        devCommand?: string;
    };
}

export const useWebContainer = ({ projectId, enabled, settings }: UseWebcontainersProps) => {
    const [status, setStatus] = useState<'idle' | 'booting' | 'installing' | 'running' | 'error'>('idle');
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [error, setError] = useState<Error | null>(null);
    const [restartKey, setRestartKey] = useState(0);
    const [terminalOutput, setTerminalOutput] = useState<string>('');

    const containerRef = useRef<WebContainer | null>(null);
    const hasStartedRef = useRef<boolean>(false);
    
    // Fetch files from Convex (auto-updates on changes)
    const files = useFiles(projectId);

    // Initial boot and mount
    useEffect(() => {
        if (!enabled || !files || files.length === 0 || hasStartedRef.current) {
            return;
        }

        hasStartedRef.current = true;

        const start = async () => {
            try {
                setStatus('booting');
                setError(null);
                setTerminalOutput('');

                const appendOutput = (data: string) => {
                    setTerminalOutput(prev => prev + data);
                };

                const container = await getWebcontaier();
                containerRef.current = container;

                const fileTree = buildFileTree(files);
                await container.mount(fileTree);

                container.on('server-ready', (_port, url) => {
                    setPreviewUrl(url);
                    setStatus('running');
                });

                setStatus('installing');

                // Parse install command (default: npm install)
                const installCmd = settings?.installCommand || 'npm install';
                const [installBin, ...installArgs] = installCmd.split(' ');

                appendOutput(`$ ${installCmd}\n`);

                const installProcess = await container.spawn(installBin, installArgs);

                installProcess.output.pipeTo(new WritableStream({
                    write(data) {
                        appendOutput(data);
                    }
                }));

                const installExitCode = await installProcess.exit;

                if (installExitCode !== 0) {
                    throw new Error(`Install command failed with exit code ${installExitCode}`);
                }

                // Parse developer command (default: npm run dev)
                const devCmd = settings?.devCommand || 'npm run dev';
                const [ devBin, ...devArgs ] = devCmd.split(' ');
                appendOutput(`\n$ ${devCmd}\n`);

                const devProcess = await container.spawn(devBin, devArgs);

                devProcess.output.pipeTo(new WritableStream({
                    write(data) {
                        appendOutput(data);
                    }
                }));

                
            } catch (err) {
                setError(err instanceof Error ? err : new Error(String(err)));
                setStatus('error');
            }

            start();
        }
    }, [
        enabled,
        files,
        restartKey,
        settings?.installCommand,
        settings?.devCommand,
    ]);

    // Sync file changes (hot reload)
    useEffect(() => {
        const container = containerRef.current;

        if (!container || !files || status !== 'running') {
            return;
        }

        const filesMap = new Map(files.map(f => [f._id, f]));

        for (const file of files) {
            if (file.type !== 'file' || file.storageId || !file.content) continue;

            const filePath = getFilePath(file, filesMap);

            container.fs.writeFile(filePath, file.content);
        }
    }, [files, status]);

    // Reset when disabled
    useEffect(() => {
        if (!enabled) {
            hasStartedRef.current = false;
            setStatus('idle');
            setPreviewUrl(null);
            setError(null);
        }
    }, [enabled]);

    // Restart the entire Webcontainer process
    const restart = useCallback(() => {
        teardownWebcontainer();
        containerRef.current = null;
        hasStartedRef.current = false;
        setStatus('idle');
        setPreviewUrl(null);
        setError(null);
        setRestartKey((k) => k + 1);
    }, []);

    return {
        status,
        previewUrl,
        error,
        restart,
        terminalOutput,
    };
};
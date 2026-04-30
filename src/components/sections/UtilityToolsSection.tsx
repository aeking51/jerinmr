import { memo, useCallback, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Hash, FileCode, Code2, Copy, Info, Globe, Loader2, CheckCircle, XCircle, Clock, Shield, ArrowRight, AlertTriangle, Calendar, Zap, Lock, RefreshCw, Network, FileText, ChevronDown, ChevronUp, Terminal } from 'lucide-react';
import { SSHTerminal } from '@/components/SSHTerminal';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

interface WebsiteStatus {
  url: string;
  isOnline: boolean;
  statusCode: number | null;
  statusText: string;
  responseTime: number;
  contentType: string | null;
  server: string | null;
  contentLength: string | null;
  redirected: boolean;
  finalUrl: string;
  timestamp: string;
  performanceGrade: 'A' | 'B' | 'C' | 'D' | 'F';
  isHttps: boolean;
}

interface SSLCertInfo {
  hostname: string;
  issuer: string;
  subject: string;
  validFrom: string;
  validTo: string;
  daysUntilExpiry: number;
  status: 'valid' | 'warning' | 'critical' | 'expired';
  serialNumber: string;
  error?: string;
}

interface DNSInfo {
  hostname: string;
  dnsLookupTime: number;
  ipv4Addresses: string[];
  ipv6Addresses: string[];
  nameservers: string[];
  resolvedAt: string;
  error?: string;
}

interface HeadersInfo {
  url: string;
  statusCode: number;
  statusText: string;
  headers: Record<string, string>;
  categorized: {
    security: Record<string, string>;
    cache: Record<string, string>;
    other: Record<string, string>;
  };
  securityScore: number;
  maxSecurityScore: number;
  totalHeaders: number;
  error?: string;
}

export const UtilityToolsSection = memo(function UtilityToolsSection() {
  const [base64Input, setBase64Input] = useState('');
  const [base64Output, setBase64Output] = useState('');
  const [hashInput, setHashInput] = useState('');
  const [hashOutputs, setHashOutputs] = useState<any>(null);
  const [jsonInput, setJsonInput] = useState('');
  const [jsonOutput, setJsonOutput] = useState('');
  const [websiteUrl, setWebsiteUrl] = useState('');
  const [websiteStatus, setWebsiteStatus] = useState<WebsiteStatus | null>(null);
  const [isCheckingWebsite, setIsCheckingWebsite] = useState(false);
  const [websiteHistory, setWebsiteHistory] = useState<WebsiteStatus[]>([]);
  const [sslInfo, setSSLInfo] = useState<SSLCertInfo | null>(null);
  const [isCheckingSSL, setIsCheckingSSL] = useState(false);
  const [dnsInfo, setDnsInfo] = useState<DNSInfo | null>(null);
  const [isCheckingDNS, setIsCheckingDNS] = useState(false);
  const [headersInfo, setHeadersInfo] = useState<HeadersInfo | null>(null);
  const [isCheckingHeaders, setIsCheckingHeaders] = useState(false);
  const [expandedHeaderSection, setExpandedHeaderSection] = useState<string | null>('security');
  const handleBase64Encode = () => {
    try {
      const encoded = btoa(base64Input);
      setBase64Output(encoded);
    } catch (error) {
      setBase64Output('Error: Invalid input');
    }
  };

  const handleBase64Decode = () => {
    try {
      const decoded = atob(base64Input);
      setBase64Output(decoded);
    } catch (error) {
      setBase64Output('Error: Invalid base64 string');
    }
  };

  const handleHash = async () => {
    if (!hashInput.trim()) return;
    
    const encoder = new TextEncoder();
    const data = encoder.encode(hashInput);
    
    const hashes: any = {};
    
    try {
      const sha256 = await crypto.subtle.digest('SHA-256', data);
      hashes.sha256 = Array.from(new Uint8Array(sha256))
        .map(b => b.toString(16).padStart(2, '0'))
        .join('');
        
      const sha512 = await crypto.subtle.digest('SHA-512', data);
      hashes.sha512 = Array.from(new Uint8Array(sha512))
        .map(b => b.toString(16).padStart(2, '0'))
        .join('');
        
      setHashOutputs(hashes);
    } catch (error) {
      setHashOutputs({ error: 'Hash generation failed' });
    }
  };

  const handleJsonFormat = () => {
    try {
      const parsed = JSON.parse(jsonInput);
      const formatted = JSON.stringify(parsed, null, 2);
      setJsonOutput(formatted);
    } catch (error) {
      setJsonOutput('Error: Invalid JSON');
    }
  };

  const handleJsonMinify = () => {
    try {
      const parsed = JSON.parse(jsonInput);
      const minified = JSON.stringify(parsed);
      setJsonOutput(minified);
    } catch (error) {
      setJsonOutput('Error: Invalid JSON');
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard!');
  };

  const handleWebsiteCheck = async () => {
    if (!websiteUrl.trim()) {
      toast.error('Please enter a URL');
      return;
    }

    let urlToCheck = websiteUrl.trim();
    if (!urlToCheck.startsWith('http://') && !urlToCheck.startsWith('https://')) {
      urlToCheck = 'https://' + urlToCheck;
    }

    setIsCheckingWebsite(true);
    const startTime = performance.now();

    try {
      const response = await fetch(urlToCheck, {
        method: 'HEAD',
        mode: 'no-cors',
      });

      const endTime = performance.now();
      const responseTime = Math.round(endTime - startTime);

      // Calculate performance grade based on response time
      const getPerformanceGrade = (time: number): 'A' | 'B' | 'C' | 'D' | 'F' => {
        if (time < 200) return 'A';
        if (time < 500) return 'B';
        if (time < 1000) return 'C';
        if (time < 2000) return 'D';
        return 'F';
      };

      // With no-cors, we can't read the response, but we know it reached
      const result: WebsiteStatus = {
        url: urlToCheck,
        isOnline: true,
        statusCode: response.type === 'opaque' ? null : response.status,
        statusText: response.type === 'opaque' ? 'Reachable (CORS restricted)' : response.statusText || 'OK',
        responseTime,
        contentType: response.headers.get('content-type'),
        server: response.headers.get('server'),
        contentLength: response.headers.get('content-length'),
        redirected: response.redirected,
        finalUrl: response.url || urlToCheck,
        timestamp: new Date().toLocaleTimeString(),
        performanceGrade: getPerformanceGrade(responseTime),
        isHttps: urlToCheck.startsWith('https://'),
      };

      setWebsiteStatus(result);
      setWebsiteHistory(prev => [result, ...prev.slice(0, 9)]);
      toast.success('Website check complete!');
    } catch (error) {
      const endTime = performance.now();
      const responseTime = Math.round(endTime - startTime);

      const result: WebsiteStatus = {
        url: urlToCheck,
        isOnline: false,
        statusCode: null,
        statusText: error instanceof Error ? error.message : 'Connection failed',
        responseTime,
        contentType: null,
        server: null,
        contentLength: null,
        redirected: false,
        finalUrl: urlToCheck,
        timestamp: new Date().toLocaleTimeString(),
        performanceGrade: 'F',
        isHttps: urlToCheck.startsWith('https://'),
      };

      setWebsiteStatus(result);
      setWebsiteHistory(prev => [result, ...prev.slice(0, 9)]);
      toast.error('Website appears to be down or unreachable');
    } finally {
      setIsCheckingWebsite(false);
    }
  };

  const handleSSLCheck = async () => {
    if (!websiteUrl.trim()) {
      toast.error('Please enter a URL first');
      return;
    }

    let hostname = websiteUrl.trim();
    hostname = hostname.replace(/^https?:\/\//, '').split('/')[0].split(':')[0];

    setIsCheckingSSL(true);
    setSSLInfo(null);

    try {
      const { data, error } = await supabase.functions.invoke('check-ssl', {
        body: { hostname }
      });

      if (error) throw error;

      if (data.error) {
        setSSLInfo({ 
          hostname, 
          error: data.error,
          issuer: '',
          subject: '',
          validFrom: '',
          validTo: '',
          daysUntilExpiry: 0,
          status: 'expired',
          serialNumber: ''
        });
        toast.error(data.error);
      } else {
        setSSLInfo(data);
        if (data.status === 'expired') {
          toast.error('SSL certificate has expired!');
        } else if (data.status === 'critical') {
          toast.warning(`SSL expires in ${data.daysUntilExpiry} days!`);
        } else if (data.status === 'warning') {
          toast.warning(`SSL expires in ${data.daysUntilExpiry} days`);
        } else {
          toast.success('SSL certificate is valid');
        }
      }
    } catch (error) {
      console.error('SSL check error:', error);
      toast.error('Failed to check SSL certificate');
      setSSLInfo({
        hostname,
        error: 'Failed to connect to SSL check service',
        issuer: '',
        subject: '',
        validFrom: '',
        validTo: '',
        daysUntilExpiry: 0,
        status: 'expired',
        serialNumber: ''
      });
    } finally {
      setIsCheckingSSL(false);
    }
  };

  const getSSLStatusColor = (status: string) => {
    switch (status) {
      case 'valid': return 'text-green-500';
      case 'warning': return 'text-yellow-500';
      case 'critical': return 'text-orange-500';
      case 'expired': return 'text-destructive';
      default: return 'text-terminal-gray';
    }
  };

  const getSSLStatusIcon = (status: string) => {
    switch (status) {
      case 'valid': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'warning': return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case 'critical': return <AlertTriangle className="h-4 w-4 text-orange-500" />;
      case 'expired': return <XCircle className="h-4 w-4 text-destructive" />;
      default: return <Shield className="h-4 w-4" />;
    }
  };

  const getPerformanceGradeColor = (grade: string) => {
    switch (grade) {
      case 'A': return 'text-green-500 bg-green-500/10';
      case 'B': return 'text-emerald-400 bg-emerald-400/10';
      case 'C': return 'text-yellow-500 bg-yellow-500/10';
      case 'D': return 'text-orange-500 bg-orange-500/10';
      case 'F': return 'text-destructive bg-destructive/10';
      default: return 'text-terminal-gray bg-muted';
    }
  };

  const handleDNSLookup = async () => {
    if (!websiteUrl.trim()) {
      toast.error('Please enter a URL first');
      return;
    }

    let hostname = websiteUrl.trim();
    hostname = hostname.replace(/^https?:\/\//, '').split('/')[0].split(':')[0];

    setIsCheckingDNS(true);
    setDnsInfo(null);

    try {
      const { data, error } = await supabase.functions.invoke('dns-lookup', {
        body: { hostname }
      });

      if (error) throw error;

      if (data.error) {
        setDnsInfo({ 
          hostname, 
          error: data.error,
          dnsLookupTime: 0,
          ipv4Addresses: [],
          ipv6Addresses: [],
          nameservers: [],
          resolvedAt: new Date().toISOString()
        });
        toast.error(data.error);
      } else {
        setDnsInfo(data);
        toast.success(`DNS resolved in ${data.dnsLookupTime}ms`);
      }
    } catch (error) {
      console.error('DNS lookup error:', error);
      toast.error('Failed to perform DNS lookup');
      setDnsInfo({
        hostname,
        error: 'Failed to connect to DNS lookup service',
        dnsLookupTime: 0,
        ipv4Addresses: [],
        ipv6Addresses: [],
        nameservers: [],
        resolvedAt: new Date().toISOString()
      });
    } finally {
      setIsCheckingDNS(false);
    }
  };

  const getDNSTimeColor = (time: number) => {
    if (time < 50) return 'text-green-500';
    if (time < 100) return 'text-emerald-400';
    if (time < 200) return 'text-yellow-500';
    return 'text-orange-500';
  };

  const handleHeadersCheck = async () => {
    if (!websiteUrl.trim()) {
      toast.error('Please enter a URL first');
      return;
    }

    setIsCheckingHeaders(true);
    setHeadersInfo(null);

    try {
      const { data, error } = await supabase.functions.invoke('fetch-headers', {
        body: { url: websiteUrl.trim() }
      });

      if (error) throw error;

      if (data.error) {
        setHeadersInfo({ 
          url: websiteUrl.trim(),
          error: data.error,
          statusCode: 0,
          statusText: '',
          headers: {},
          categorized: { security: {}, cache: {}, other: {} },
          securityScore: 0,
          maxSecurityScore: 7,
          totalHeaders: 0
        });
        toast.error(data.error);
      } else {
        setHeadersInfo(data);
        toast.success(`Found ${data.totalHeaders} headers`);
      }
    } catch (error) {
      console.error('Headers check error:', error);
      toast.error('Failed to fetch headers');
      setHeadersInfo({
        url: websiteUrl.trim(),
        error: 'Failed to connect to headers service',
        statusCode: 0,
        statusText: '',
        headers: {},
        categorized: { security: {}, cache: {}, other: {} },
        securityScore: 0,
        maxSecurityScore: 7,
        totalHeaders: 0
      });
    } finally {
      setIsCheckingHeaders(false);
    }
  };

  const getSecurityScoreColor = (score: number, max: number) => {
    const percentage = (score / max) * 100;
    if (percentage >= 70) return 'text-green-500';
    if (percentage >= 40) return 'text-yellow-500';
    return 'text-orange-500';
  };

  const toggleHeaderSection = (section: string) => {
    setExpandedHeaderSection(prev => prev === section ? null : section);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2 text-terminal-green">$ utility_tools</h2>
        <p className="text-terminal-gray">Developer utilities and converters</p>
      </div>

      <Tabs defaultValue="base64" className="w-full">
        <TabsList className="flex w-full sm:grid sm:grid-cols-5 overflow-x-auto scrollbar-thin">
          <TabsTrigger value="base64" className="text-xs sm:text-sm flex-1 min-w-0">Base64</TabsTrigger>
          <TabsTrigger value="hash" className="text-xs sm:text-sm flex-1 min-w-0">Hash</TabsTrigger>
          <TabsTrigger value="json" className="text-xs sm:text-sm flex-1 min-w-0">JSON</TabsTrigger>
          <TabsTrigger value="website" className="text-xs sm:text-sm flex-1 min-w-0">Monitor</TabsTrigger>
          <TabsTrigger value="ssh" className="flex items-center justify-center gap-1 text-xs sm:text-sm flex-1 min-w-0">
            <Terminal className="h-3 w-3 flex-shrink-0" />
            SSH
          </TabsTrigger>
        </TabsList>

        <TabsContent value="base64" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Code2 className="h-5 w-5" />
                Base64 Encoder/Decoder
              </CardTitle>
              <CardDescription className="flex items-start gap-2">
                <Info className="h-4 w-4 mt-0.5 flex-shrink-0" />
                <span>Encode text to Base64 format or decode Base64 strings back to plain text. Useful for data transmission, API authentication, and encoding binary data.</span>
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Textarea
                placeholder="Enter text to encode/decode"
                value={base64Input}
                onChange={(e) => setBase64Input(e.target.value)}
                className="font-mono text-sm min-h-[100px]"
              />
              
              <div className="flex gap-2">
                <Button onClick={handleBase64Encode}>Encode</Button>
                <Button onClick={handleBase64Decode} variant="outline">Decode</Button>
              </div>

              {base64Output && (
                <div className="p-4 rounded border bg-muted">
                  <div className="flex justify-between items-center mb-2">
                    <div className="text-xs text-terminal-gray">Output:</div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyToClipboard(base64Output)}
                      className="h-6"
                    >
                      <Copy className="h-3 w-3 mr-1" />
                      Copy
                    </Button>
                  </div>
                  <div className="font-mono text-sm break-all">{base64Output}</div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="hash" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Hash className="h-5 w-5" />
                Hash Generator
              </CardTitle>
              <CardDescription className="flex items-start gap-2">
                <Info className="h-4 w-4 mt-0.5 flex-shrink-0" />
                <span>Generate cryptographic hashes (SHA-256, SHA-512) for text. Useful for password verification, data integrity checks, and creating unique identifiers.</span>
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Textarea
                placeholder="Enter text to hash"
                value={hashInput}
                onChange={(e) => setHashInput(e.target.value)}
                className="font-mono text-sm min-h-[100px]"
              />
              
              <Button onClick={handleHash}>Generate Hashes</Button>

              {hashOutputs && (
                <div className="space-y-3">
                  {hashOutputs.error ? (
                    <div className="text-destructive text-sm">{hashOutputs.error}</div>
                  ) : (
                    <>
                      <div className="p-3 rounded border bg-muted">
                        <div className="flex justify-between items-center mb-1">
                          <div className="text-xs text-terminal-gray">SHA-256:</div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => copyToClipboard(hashOutputs.sha256)}
                            className="h-6"
                          >
                            <Copy className="h-3 w-3 mr-1" />
                            Copy
                          </Button>
                        </div>
                        <div className="font-mono text-xs break-all">{hashOutputs.sha256}</div>
                      </div>
                      <div className="p-3 rounded border bg-muted">
                        <div className="flex justify-between items-center mb-1">
                          <div className="text-xs text-terminal-gray">SHA-512:</div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => copyToClipboard(hashOutputs.sha512)}
                            className="h-6"
                          >
                            <Copy className="h-3 w-3 mr-1" />
                            Copy
                          </Button>
                        </div>
                        <div className="font-mono text-xs break-all">{hashOutputs.sha512}</div>
                      </div>
                    </>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="json" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileCode className="h-5 w-5" />
                JSON Formatter
              </CardTitle>
              <CardDescription className="flex items-start gap-2">
                <Info className="h-4 w-4 mt-0.5 flex-shrink-0" />
                <span>Format JSON with proper indentation for readability or minify it to reduce size. Validates JSON syntax and displays errors for invalid input.</span>
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Textarea
                placeholder="Enter JSON to format or minify"
                value={jsonInput}
                onChange={(e) => setJsonInput(e.target.value)}
                className="font-mono text-sm min-h-[150px]"
              />
              
              <div className="flex gap-2">
                <Button onClick={handleJsonFormat}>Format</Button>
                <Button onClick={handleJsonMinify} variant="outline">Minify</Button>
              </div>

              {jsonOutput && (
                <div className="p-4 rounded border bg-muted">
                  <div className="flex justify-between items-center mb-2">
                    <div className="text-xs text-terminal-gray">Output:</div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyToClipboard(jsonOutput)}
                      className="h-6"
                    >
                      <Copy className="h-3 w-3 mr-1" />
                      Copy
                    </Button>
                  </div>
                  <pre className="font-mono text-xs overflow-auto max-h-[300px]">{jsonOutput}</pre>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="website" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5" />
                Website Status Checker
              </CardTitle>
              <CardDescription className="flex items-start gap-2">
                <Info className="h-4 w-4 mt-0.5 flex-shrink-0" />
                <span>Check if a website is online and get response details including response time, status code, and server information.</span>
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Input
                  placeholder="Enter website URL (e.g., google.com)"
                  value={websiteUrl}
                  onChange={(e) => setWebsiteUrl(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleWebsiteCheck()}
                  className="font-mono text-sm"
                />
                <Button onClick={handleWebsiteCheck} disabled={isCheckingWebsite}>
                  {isCheckingWebsite ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    'Check'
                  )}
                </Button>
              </div>

              {websiteStatus && (
                <div className="p-4 rounded border bg-muted space-y-4">
                  {/* Header with status and performance grade */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {websiteStatus.isOnline ? (
                        <CheckCircle className="h-5 w-5 text-green-500" />
                      ) : (
                        <XCircle className="h-5 w-5 text-destructive" />
                      )}
                      <span className={`font-semibold ${websiteStatus.isOnline ? 'text-green-500' : 'text-destructive'}`}>
                        {websiteStatus.isOnline ? 'Online' : 'Offline / Unreachable'}
                      </span>
                      <div className={`px-2 py-0.5 rounded font-bold text-sm ${getPerformanceGradeColor(websiteStatus.performanceGrade)}`}>
                        {websiteStatus.performanceGrade}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleWebsiteCheck}
                        disabled={isCheckingWebsite}
                        className="h-6 px-2"
                      >
                        <RefreshCw className={`h-3 w-3 ${isCheckingWebsite ? 'animate-spin' : ''}`} />
                      </Button>
                      <span className="text-xs text-terminal-gray">{websiteStatus.timestamp}</span>
                    </div>
                  </div>

                  {/* Quick Stats */}
                  <div className="grid grid-cols-4 gap-2">
                    <div className="p-2 rounded bg-background/50 text-center">
                      <div className="flex items-center justify-center gap-1 text-xs text-terminal-gray mb-1">
                        <Clock className="h-3 w-3" /> Response
                      </div>
                      <div className={`font-mono text-sm font-semibold ${
                        websiteStatus.responseTime < 300 ? 'text-green-500' : 
                        websiteStatus.responseTime < 1000 ? 'text-yellow-500' : 'text-destructive'
                      }`}>
                        {websiteStatus.responseTime}ms
                      </div>
                    </div>
                    <div className="p-2 rounded bg-background/50 text-center">
                      <div className="flex items-center justify-center gap-1 text-xs text-terminal-gray mb-1">
                        <Lock className="h-3 w-3" /> Protocol
                      </div>
                      <div className={`font-mono text-sm font-semibold ${websiteStatus.isHttps ? 'text-green-500' : 'text-yellow-500'}`}>
                        {websiteStatus.isHttps ? 'HTTPS' : 'HTTP'}
                      </div>
                    </div>
                    <div className="p-2 rounded bg-background/50 text-center">
                      <div className="flex items-center justify-center gap-1 text-xs text-terminal-gray mb-1">
                        <Globe className="h-3 w-3" /> Status
                      </div>
                      <div className="font-mono text-sm font-semibold">
                        {websiteStatus.statusCode || '—'}
                      </div>
                    </div>
                    <div className="p-2 rounded bg-background/50 text-center">
                      <div className="flex items-center justify-center gap-1 text-xs text-terminal-gray mb-1">
                        <Zap className="h-3 w-3" /> Grade
                      </div>
                      <div className={`font-mono text-sm font-semibold ${getPerformanceGradeColor(websiteStatus.performanceGrade).split(' ')[0]}`}>
                        {websiteStatus.performanceGrade}
                      </div>
                    </div>
                  </div>

                  {/* Detailed Info */}
                  <div className="grid grid-cols-2 gap-3 text-sm pt-2 border-t border-border">
                    <div className="space-y-1">
                      <div className="text-xs text-terminal-gray">URL</div>
                      <div className="font-mono text-xs break-all">{websiteStatus.url}</div>
                    </div>
                    
                    <div className="space-y-1">
                      <div className="text-xs text-terminal-gray">Status Message</div>
                      <div className="font-mono text-xs">
                        {websiteStatus.statusCode ? `${websiteStatus.statusCode} ${websiteStatus.statusText}` : websiteStatus.statusText}
                      </div>
                    </div>

                    {websiteStatus.redirected && (
                      <div className="space-y-1">
                        <div className="text-xs text-terminal-gray flex items-center gap-1">
                          <ArrowRight className="h-3 w-3" /> Redirected To
                        </div>
                        <div className="font-mono text-xs break-all">{websiteStatus.finalUrl}</div>
                      </div>
                    )}

                    {websiteStatus.server && (
                      <div className="space-y-1">
                        <div className="text-xs text-terminal-gray">Server</div>
                        <div className="font-mono text-xs">{websiteStatus.server}</div>
                      </div>
                    )}

                    {websiteStatus.contentType && (
                      <div className="space-y-1">
                        <div className="text-xs text-terminal-gray">Content Type</div>
                        <div className="font-mono text-xs">{websiteStatus.contentType}</div>
                      </div>
                    )}

                    {websiteStatus.contentLength && (
                      <div className="space-y-1">
                        <div className="text-xs text-terminal-gray">Content Size</div>
                        <div className="font-mono text-xs">{(parseInt(websiteStatus.contentLength) / 1024).toFixed(1)} KB</div>
                      </div>
                    )}
                  </div>

                  <div className="pt-2 border-t border-border">
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <div className="flex items-center gap-2 text-xs text-terminal-gray">
                        <Shield className="h-3 w-3" />
                        <span>
                          {websiteStatus.url.startsWith('https://') ? 'SSL/TLS Enabled' : 'No SSL (HTTP only)'}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={handleDNSLookup}
                          disabled={isCheckingDNS}
                          className="h-6 text-xs"
                        >
                          {isCheckingDNS ? (
                            <Loader2 className="h-3 w-3 animate-spin mr-1" />
                          ) : (
                            <Network className="h-3 w-3 mr-1" />
                          )}
                          DNS
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={handleHeadersCheck}
                          disabled={isCheckingHeaders}
                          className="h-6 text-xs"
                        >
                          {isCheckingHeaders ? (
                            <Loader2 className="h-3 w-3 animate-spin mr-1" />
                          ) : (
                            <FileText className="h-3 w-3 mr-1" />
                          )}
                          Headers
                        </Button>
                        {websiteStatus.url.startsWith('https://') && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={handleSSLCheck}
                            disabled={isCheckingSSL}
                            className="h-6 text-xs"
                          >
                            {isCheckingSSL ? (
                              <Loader2 className="h-3 w-3 animate-spin mr-1" />
                            ) : (
                              <Shield className="h-3 w-3 mr-1" />
                            )}
                            SSL
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {dnsInfo && (
                <div className="p-4 rounded border bg-muted space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Network className={`h-4 w-4 ${dnsInfo.error ? 'text-destructive' : 'text-green-500'}`} />
                      <span className={`font-semibold ${dnsInfo.error ? 'text-destructive' : 'text-green-500'}`}>
                        {dnsInfo.error ? 'DNS Lookup Failed' : 'DNS Resolved'}
                      </span>
                    </div>
                    {!dnsInfo.error && (
                      <span className={`text-sm font-mono ${getDNSTimeColor(dnsInfo.dnsLookupTime)}`}>
                        {dnsInfo.dnsLookupTime}ms
                      </span>
                    )}
                  </div>

                  {dnsInfo.error ? (
                    <div className="text-sm text-terminal-gray">{dnsInfo.error}</div>
                  ) : (
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div className="space-y-1">
                        <div className="text-xs text-terminal-gray">Hostname</div>
                        <div className="font-mono text-xs">{dnsInfo.hostname}</div>
                      </div>

                      <div className="space-y-1">
                        <div className="text-xs text-terminal-gray flex items-center gap-1">
                          <Clock className="h-3 w-3" /> Lookup Time
                        </div>
                        <div className={`font-mono text-xs font-semibold ${getDNSTimeColor(dnsInfo.dnsLookupTime)}`}>
                          {dnsInfo.dnsLookupTime}ms
                        </div>
                      </div>

                      {dnsInfo.ipv4Addresses.length > 0 && (
                        <div className="space-y-1 col-span-2">
                          <div className="text-xs text-terminal-gray">IPv4 Addresses</div>
                          <div className="font-mono text-xs flex flex-wrap gap-1">
                            {dnsInfo.ipv4Addresses.map((ip, i) => (
                              <span key={i} className="bg-background/50 px-1.5 py-0.5 rounded">{ip}</span>
                            ))}
                          </div>
                        </div>
                      )}

                      {dnsInfo.ipv6Addresses.length > 0 && (
                        <div className="space-y-1 col-span-2">
                          <div className="text-xs text-terminal-gray">IPv6 Addresses</div>
                          <div className="font-mono text-xs flex flex-wrap gap-1">
                            {dnsInfo.ipv6Addresses.map((ip, i) => (
                              <span key={i} className="bg-background/50 px-1.5 py-0.5 rounded text-[10px]">{ip}</span>
                            ))}
                          </div>
                        </div>
                      )}

                      {dnsInfo.nameservers.length > 0 && (
                        <div className="space-y-1 col-span-2">
                          <div className="text-xs text-terminal-gray">Nameservers</div>
                          <div className="font-mono text-xs flex flex-wrap gap-1">
                            {dnsInfo.nameservers.map((ns, i) => (
                              <span key={i} className="bg-background/50 px-1.5 py-0.5 rounded">{ns}</span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {sslInfo && (
                <div className="p-4 rounded border bg-muted space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {getSSLStatusIcon(sslInfo.status)}
                      <span className={`font-semibold ${getSSLStatusColor(sslInfo.status)}`}>
                        {sslInfo.error ? 'SSL Check Failed' : 
                         sslInfo.status === 'valid' ? 'Certificate Valid' :
                         sslInfo.status === 'warning' ? 'Expiring Soon' :
                         sslInfo.status === 'critical' ? 'Expiring Very Soon' : 'Certificate Expired'}
                      </span>
                    </div>
                    {sslInfo.daysUntilExpiry !== undefined && !sslInfo.error && (
                      <span className={`text-sm font-mono ${getSSLStatusColor(sslInfo.status)}`}>
                        {sslInfo.daysUntilExpiry} days left
                      </span>
                    )}
                  </div>

                  {sslInfo.error ? (
                    <div className="text-sm text-terminal-gray">{sslInfo.error}</div>
                  ) : (
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div className="space-y-1">
                        <div className="text-xs text-terminal-gray">Hostname</div>
                        <div className="font-mono text-xs">{sslInfo.hostname}</div>
                      </div>

                      <div className="space-y-1">
                        <div className="text-xs text-terminal-gray flex items-center gap-1">
                          <Calendar className="h-3 w-3" /> Valid Until
                        </div>
                        <div className={`font-mono text-xs ${getSSLStatusColor(sslInfo.status)}`}>
                          {new Date(sslInfo.validTo).toLocaleDateString()}
                        </div>
                      </div>

                      <div className="space-y-1">
                        <div className="text-xs text-terminal-gray">Valid From</div>
                        <div className="font-mono text-xs">
                          {new Date(sslInfo.validFrom).toLocaleDateString()}
                        </div>
                      </div>

                      {sslInfo.issuer && (
                        <div className="space-y-1">
                          <div className="text-xs text-terminal-gray">Issuer</div>
                          <div className="font-mono text-xs truncate">{sslInfo.issuer}</div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {headersInfo && (
                <div className="p-4 rounded border bg-muted space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <FileText className={`h-4 w-4 ${headersInfo.error ? 'text-destructive' : 'text-green-500'}`} />
                      <span className={`font-semibold ${headersInfo.error ? 'text-destructive' : 'text-green-500'}`}>
                        {headersInfo.error ? 'Headers Fetch Failed' : 'HTTP Headers'}
                      </span>
                    </div>
                    {!headersInfo.error && (
                      <div className="flex items-center gap-3">
                        <span className={`text-xs font-mono ${getSecurityScoreColor(headersInfo.securityScore, headersInfo.maxSecurityScore)}`}>
                          Security: {headersInfo.securityScore}/{headersInfo.maxSecurityScore}
                        </span>
                        <span className="text-xs text-terminal-gray">
                          {headersInfo.totalHeaders} headers
                        </span>
                      </div>
                    )}
                  </div>

                  {headersInfo.error ? (
                    <div className="text-sm text-terminal-gray">{headersInfo.error}</div>
                  ) : (
                    <div className="space-y-2">
                      {/* Security Headers */}
                      <div className="border border-border rounded overflow-hidden">
                        <button
                          onClick={() => toggleHeaderSection('security')}
                          className="w-full flex items-center justify-between p-2 bg-background/50 hover:bg-background/70 transition-colors"
                        >
                          <div className="flex items-center gap-2 text-xs font-medium">
                            <Shield className="h-3 w-3 text-green-500" />
                            Security Headers ({Object.keys(headersInfo.categorized.security).length})
                          </div>
                          {expandedHeaderSection === 'security' ? (
                            <ChevronUp className="h-3 w-3" />
                          ) : (
                            <ChevronDown className="h-3 w-3" />
                          )}
                        </button>
                        {expandedHeaderSection === 'security' && (
                          <div className="p-2 space-y-1 max-h-[150px] overflow-y-auto">
                            {Object.keys(headersInfo.categorized.security).length === 0 ? (
                              <div className="text-xs text-terminal-gray italic">No security headers found</div>
                            ) : (
                              Object.entries(headersInfo.categorized.security).map(([key, value]) => (
                                <div key={key} className="text-xs">
                                  <span className="font-mono text-terminal-green">{key}:</span>
                                  <span className="font-mono text-terminal-gray ml-1 break-all">{value}</span>
                                </div>
                              ))
                            )}
                          </div>
                        )}
                      </div>

                      {/* Cache Headers */}
                      <div className="border border-border rounded overflow-hidden">
                        <button
                          onClick={() => toggleHeaderSection('cache')}
                          className="w-full flex items-center justify-between p-2 bg-background/50 hover:bg-background/70 transition-colors"
                        >
                          <div className="flex items-center gap-2 text-xs font-medium">
                            <Clock className="h-3 w-3 text-yellow-500" />
                            Cache Headers ({Object.keys(headersInfo.categorized.cache).length})
                          </div>
                          {expandedHeaderSection === 'cache' ? (
                            <ChevronUp className="h-3 w-3" />
                          ) : (
                            <ChevronDown className="h-3 w-3" />
                          )}
                        </button>
                        {expandedHeaderSection === 'cache' && (
                          <div className="p-2 space-y-1 max-h-[150px] overflow-y-auto">
                            {Object.keys(headersInfo.categorized.cache).length === 0 ? (
                              <div className="text-xs text-terminal-gray italic">No cache headers found</div>
                            ) : (
                              Object.entries(headersInfo.categorized.cache).map(([key, value]) => (
                                <div key={key} className="text-xs">
                                  <span className="font-mono text-terminal-green">{key}:</span>
                                  <span className="font-mono text-terminal-gray ml-1 break-all">{value}</span>
                                </div>
                              ))
                            )}
                          </div>
                        )}
                      </div>

                      {/* Other Headers */}
                      <div className="border border-border rounded overflow-hidden">
                        <button
                          onClick={() => toggleHeaderSection('other')}
                          className="w-full flex items-center justify-between p-2 bg-background/50 hover:bg-background/70 transition-colors"
                        >
                          <div className="flex items-center gap-2 text-xs font-medium">
                            <FileText className="h-3 w-3 text-blue-500" />
                            Other Headers ({Object.keys(headersInfo.categorized.other).length})
                          </div>
                          {expandedHeaderSection === 'other' ? (
                            <ChevronUp className="h-3 w-3" />
                          ) : (
                            <ChevronDown className="h-3 w-3" />
                          )}
                        </button>
                        {expandedHeaderSection === 'other' && (
                          <div className="p-2 space-y-1 max-h-[150px] overflow-y-auto">
                            {Object.keys(headersInfo.categorized.other).length === 0 ? (
                              <div className="text-xs text-terminal-gray italic">No other headers found</div>
                            ) : (
                              Object.entries(headersInfo.categorized.other).map(([key, value]) => (
                                <div key={key} className="text-xs">
                                  <span className="font-mono text-terminal-green">{key}:</span>
                                  <span className="font-mono text-terminal-gray ml-1 break-all">{value}</span>
                                </div>
                              ))
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {websiteHistory.length > 1 && (
                <div className="space-y-2">
                  <div className="text-xs text-terminal-gray">Recent Checks:</div>
                  <div className="space-y-1 max-h-[150px] overflow-y-auto">
                    {websiteHistory.slice(1).map((item, index) => (
                      <div key={index} className="flex items-center justify-between p-2 rounded bg-secondary text-xs">
                        <div className="flex items-center gap-2">
                          {item.isOnline ? (
                            <CheckCircle className="h-3 w-3 text-green-500" />
                          ) : (
                            <XCircle className="h-3 w-3 text-destructive" />
                          )}
                          <span className="font-mono truncate max-w-[200px]">{item.url}</span>
                        </div>
                        <div className="flex items-center gap-2 text-terminal-gray">
                          <span>{item.responseTime}ms</span>
                          <span>{item.timestamp}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="ssh" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Terminal className="h-5 w-5" />
                Web SSH Client
              </CardTitle>
              <CardDescription className="flex items-start gap-2">
                <Info className="h-4 w-4 mt-0.5 flex-shrink-0" />
                <span>Interactive SSH simulator. Type "connect" to start a session. Supports common commands like ls, cd, cat, and more. Try "help" for available commands.</span>
              </CardDescription>
            </CardHeader>
            <CardContent>
              <SSHTerminal />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
});
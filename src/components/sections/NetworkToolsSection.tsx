import { memo, useCallback, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Activity, Globe, Search, Loader2, Trash2, Copy, Info } from 'lucide-react';
import { toast } from 'sonner';

export const NetworkToolsSection = memo(function NetworkToolsSection() {
  const [pingUrl, setPingUrl] = useState('');
  const [dnsQuery, setDnsQuery] = useState('');
  const [ipLookup, setIpLookup] = useState('');
  const [loading, setLoading] = useState<string | null>(null);
  const [pingResults, setPingResults] = useState<any[]>([]);
  const [dnsHistory, setDnsHistory] = useState<any[]>([]);
  const [ipHistory, setIpHistory] = useState<any[]>([]);

  const handlePing = async () => {
    if (!pingUrl.trim()) return;
    setLoading('ping');
    const startTime = Date.now();
    
    try {
      const testUrl = pingUrl.startsWith('http') ? pingUrl : `https://${pingUrl}`;
      await fetch(testUrl, { method: 'HEAD', mode: 'no-cors' });
      const endTime = Date.now();
      
      setPingResults(prev => [{
        url: testUrl,
        status: 'success',
        time: endTime - startTime,
        timestamp: new Date().toLocaleTimeString()
      }, ...prev.slice(0, 4)]);
    } catch (error) {
      const endTime = Date.now();
      setPingResults(prev => [{
        url: pingUrl.startsWith('http') ? pingUrl : `https://${pingUrl}`,
        status: 'error',
        time: endTime - startTime,
        timestamp: new Date().toLocaleTimeString()
      }, ...prev.slice(0, 4)]);
    } finally {
      setLoading(null);
    }
  };

  const handleDnsLookup = async () => {
    if (!dnsQuery.trim()) return;
    setLoading('dns');
    
    try {
      const response = await fetch(`https://dns.google/resolve?name=${dnsQuery}&type=A`);
      const data = await response.json();
      const result = {
        ...data,
        query: dnsQuery,
        timestamp: new Date().toLocaleTimeString()
      };
      setDnsHistory(prev => [result, ...prev.slice(0, 9)]);
    } catch (error) {
      const result = {
        error: 'DNS lookup failed',
        query: dnsQuery,
        timestamp: new Date().toLocaleTimeString()
      };
      setDnsHistory(prev => [result, ...prev.slice(0, 9)]);
    } finally {
      setLoading(null);
    }
  };

  const handleIpLookup = async () => {
    const query = ipLookup.trim() || undefined;
    setLoading('ip');
    
    try {
      const url = query ? `https://ipapi.co/${query}/json/` : 'https://ipapi.co/json/';
      const response = await fetch(url);
      const data = await response.json();
      const result = {
        ...data,
        query: query || 'Current IP',
        timestamp: new Date().toLocaleTimeString()
      };
      setIpHistory(prev => [result, ...prev.slice(0, 9)]);
    } catch (error) {
      const result = {
        error: 'IP lookup failed',
        query: query || 'Current IP',
        timestamp: new Date().toLocaleTimeString()
      };
      setIpHistory(prev => [result, ...prev.slice(0, 9)]);
    } finally {
      setLoading(null);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard!');
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2 text-terminal-green">$ network_tools</h2>
        <p className="text-terminal-gray">Network diagnostics and utilities</p>
      </div>

      <Tabs defaultValue="ping" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="ping">Ping</TabsTrigger>
          <TabsTrigger value="dns">DNS Lookup</TabsTrigger>
          <TabsTrigger value="ip">IP Info</TabsTrigger>
        </TabsList>

        <TabsContent value="ping" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Ping Test
              </CardTitle>
              <CardDescription className="flex items-start gap-2">
                <Info className="h-4 w-4 mt-0.5 flex-shrink-0" />
                <span>Test network connectivity and latency to any URL or domain. Note: Due to browser limitations, this uses HTTP HEAD requests instead of ICMP ping.</span>
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-col sm:flex-row gap-2">
                <Input
                  placeholder="Enter URL (e.g., google.com)"
                  value={pingUrl}
                  onChange={(e) => setPingUrl(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handlePing()}
                  disabled={loading === 'ping'}
                />
                <div className="flex gap-2">
                  <Button onClick={handlePing} disabled={loading === 'ping' || !pingUrl.trim()} className="flex-1 sm:flex-none">
                    {loading === 'ping' ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Ping'}
                  </Button>
                  {pingResults.length > 0 && (
                    <Button 
                      variant="outline" 
                      size="icon"
                      onClick={() => setPingResults([])}
                      title="Clear history"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>

              {pingResults.length > 0 && (
                <div className="text-xs text-terminal-gray">History (Last 5 results)</div>
              )}
              {pingResults.length > 0 && (
                <div className="space-y-2 font-mono text-xs">
                  {pingResults.map((result, index) => (
                    <div
                      key={index}
                      className={`p-3 rounded border ${
                        result.status === 'success'
                          ? 'bg-terminal-green/10 border-terminal-green/30'
                          : 'bg-destructive/10 border-destructive/30'
                      }`}
                    >
                      <div className="flex justify-between items-start gap-2">
                        <div className="flex-1 min-w-0">
                          <div className="text-terminal-gray">{result.timestamp}</div>
                          <div className="mt-1 break-all">{result.url}</div>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <div className={result.status === 'success' ? 'text-terminal-green' : 'text-destructive'}>
                            {result.status === 'success' ? '✓' : '✗'} {result.time}ms
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6"
                            onClick={() => copyToClipboard(`${result.url} - ${result.time}ms`)}
                          >
                            <Copy className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="dns" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Search className="h-5 w-5" />
                DNS Lookup
              </CardTitle>
              <CardDescription className="flex items-start gap-2">
                <Info className="h-4 w-4 mt-0.5 flex-shrink-0" />
                <span>Resolve domain names to IP addresses using Google's public DNS service. Returns A records (IPv4 addresses) for the queried domain.</span>
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-col sm:flex-row gap-2">
                <Input
                  placeholder="Enter domain (e.g., google.com)"
                  value={dnsQuery}
                  onChange={(e) => setDnsQuery(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleDnsLookup()}
                  disabled={loading === 'dns'}
                />
                <div className="flex gap-2">
                  <Button onClick={handleDnsLookup} disabled={loading === 'dns' || !dnsQuery.trim()} className="flex-1 sm:flex-none">
                    {loading === 'dns' ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Lookup'}
                  </Button>
                  {dnsHistory.length > 0 && (
                    <Button 
                      variant="outline" 
                      size="icon"
                      onClick={() => setDnsHistory([])}
                      title="Clear history"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>

              {dnsHistory.length > 0 && (
                <div className="text-xs text-terminal-gray">History (Last 10 results)</div>
              )}
              {dnsHistory.length > 0 && (
                <div className="space-y-2">
                  {dnsHistory.map((result, index) => (
                    <div
                      key={index}
                      className={`p-3 rounded border font-mono text-xs ${
                        result.error
                          ? 'bg-destructive/10 border-destructive/30'
                          : 'bg-terminal-green/10 border-terminal-green/30'
                      }`}
                    >
                      <div className="flex justify-between items-start gap-2 mb-2">
                        <div className="text-terminal-gray">{result.timestamp}</div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6"
                          onClick={() => copyToClipboard(result.Answer?.map((a: any) => a.data).join(', ') || result.query)}
                        >
                          <Copy className="h-3 w-3" />
                        </Button>
                      </div>
                      {result.error ? (
                        <div className="text-destructive">{result.error}</div>
                      ) : (
                        <div className="space-y-1">
                          <div><span className="text-terminal-gray">Query:</span> {result.Question?.[0]?.name}</div>
                          {result.Answer?.map((answer: any, idx: number) => (
                            <div key={idx}>
                              <span className="text-terminal-green">IP:</span> {answer.data}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="ip" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5" />
                IP Information
              </CardTitle>
              <CardDescription className="flex items-start gap-2">
                <Info className="h-4 w-4 mt-0.5 flex-shrink-0" />
                <span>Get detailed geolocation and network information for any IP address. Leave empty to check your current public IP address.</span>
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-col sm:flex-row gap-2">
                <Input
                  placeholder="Enter IP address (leave empty for your IP)"
                  value={ipLookup}
                  onChange={(e) => setIpLookup(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleIpLookup()}
                  disabled={loading === 'ip'}
                />
                <div className="flex gap-2">
                  <Button onClick={handleIpLookup} disabled={loading === 'ip'} className="flex-1 sm:flex-none">
                    {loading === 'ip' ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Lookup'}
                  </Button>
                  {ipHistory.length > 0 && (
                    <Button 
                      variant="outline" 
                      size="icon"
                      onClick={() => setIpHistory([])}
                      title="Clear history"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>

              {ipHistory.length > 0 && (
                <div className="text-xs text-terminal-gray">History (Last 10 results)</div>
              )}
              {ipHistory.length > 0 && (
                <div className="space-y-2">
                  {ipHistory.map((result, index) => (
                    <div
                      key={index}
                      className={`p-3 rounded border font-mono text-xs ${
                        result.error
                          ? 'bg-destructive/10 border-destructive/30'
                          : 'bg-terminal-green/10 border-terminal-green/30'
                      }`}
                    >
                      <div className="flex justify-between items-start gap-2 mb-2">
                        <div className="text-terminal-gray">{result.timestamp}</div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6"
                          onClick={() => copyToClipboard(`${result.ip} - ${result.city}, ${result.country_name}`)}
                        >
                          <Copy className="h-3 w-3" />
                        </Button>
                      </div>
                      {result.error ? (
                        <div className="text-destructive">{result.error}</div>
                      ) : (
                        <div className="space-y-1">
                          <div><span className="text-terminal-gray">IP:</span> {result.ip}</div>
                          <div><span className="text-terminal-gray">Location:</span> {result.city}, {result.region}, {result.country_name}</div>
                          <div><span className="text-terminal-gray">ISP:</span> {result.org}</div>
                          <div><span className="text-terminal-gray">Timezone:</span> {result.timezone}</div>
                          <div><span className="text-terminal-gray">Coordinates:</span> {result.latitude}, {result.longitude}</div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
<?php

namespace App\Domain\Epp\Commands;

class EppDomainCommands
{
    /**
     * Build domain:check EPP XML.
     */
    public static function check(array $domains, string $clTRID): string
    {
        $xml = '<?xml version="1.0" encoding="UTF-8" standalone="no"?>' . "\n" .
               '<epp xmlns="urn:ietf:params:xml:ns:epp-1.0">' . "\n" .
               '  <command>' . "\n" .
               '    <check>' . "\n" .
               '      <domain:check xmlns:domain="urn:ietf:params:xml:ns:domain-1.0">' . "\n";

        foreach ($domains as $domain) {
            $xml .= '        <domain:name>' . htmlspecialchars($domain) . '</domain:name>' . "\n";
        }

        $xml .= '      </domain:check>' . "\n" .
                '    </check>' . "\n" .
                '    <clTRID>' . htmlspecialchars($clTRID) . '</clTRID>' . "\n" .
                '  </command>' . "\n" .
                '</epp>';

        return $xml;
    }

    /**
     * Build domain:info EPP XML.
     */
    public static function info(string $domain, string $clTRID, ?string $authInfo = null): string
    {
        $xml = '<?xml version="1.0" encoding="UTF-8" standalone="no"?>' . "\n" .
               '<epp xmlns="urn:ietf:params:xml:ns:epp-1.0">' . "\n" .
               '  <command>' . "\n" .
               '    <info>' . "\n" .
               '      <domain:info xmlns:domain="urn:ietf:params:xml:ns:domain-1.0">' . "\n" .
               '        <domain:name>' . htmlspecialchars($domain) . '</domain:name>' . "\n";

        if ($authInfo) {
            $xml .= '        <domain:authInfo>' . "\n" .
                    '          <domain:pw>' . htmlspecialchars($authInfo) . '</domain:pw>' . "\n" .
                    '        </domain:authInfo>' . "\n";
        }

        $xml .= '      </domain:info>' . "\n" .
                '    </info>' . "\n" .
                '    <clTRID>' . htmlspecialchars($clTRID) . '</clTRID>' . "\n" .
                '  </command>' . "\n" .
                '</epp>';

        return $xml;
    }

    /**
     * Build domain:create EPP XML.
     */
    public static function create(array $params, string $clTRID): string
    {
        $xml = '<?xml version="1.0" encoding="UTF-8" standalone="no"?>' . "\n" .
               '<epp xmlns="urn:ietf:params:xml:ns:epp-1.0">' . "\n" .
               '  <command>' . "\n" .
               '    <create>' . "\n" .
               '      <domain:create xmlns:domain="urn:ietf:params:xml:ns:domain-1.0">' . "\n" .
               '        <domain:name>' . htmlspecialchars($params['domain']) . '</domain:name>' . "\n" .
               '        <domain:period unit="y">' . (int)$params['years'] . '</domain:period>' . "\n";

        // Nameservers
        if (!empty($params['nameservers'])) {
            $xml .= '        <domain:ns>' . "\n";
            foreach ($params['nameservers'] as $ns) {
                $xml .= '          <domain:hostObj>' . htmlspecialchars($ns) . '</domain:hostObj>' . "\n";
            }
            $xml .= '        </domain:ns>' . "\n";
        }

        // Registrant
        $xml .= '        <domain:registrant>' . htmlspecialchars($params['registrant']) . '</domain:registrant>' . "\n";

        // Contacts
        if (!empty($params['contacts'])) {
            foreach ($params['contacts'] as $type => $contactId) {
                $xml .= '        <domain:contact type="' . htmlspecialchars($type) . '">' . 
                        htmlspecialchars($contactId) . '</domain:contact>' . "\n";
            }
        }

        // Auth info
        if (!empty($params['authInfo'])) {
            $xml .= '        <domain:authInfo>' . "\n" .
                    '          <domain:pw>' . htmlspecialchars($params['authInfo']) . '</domain:pw>' . "\n" .
                    '        </domain:authInfo>' . "\n";
        }

        $xml .= '      </domain:create>' . "\n" .
                '    </create>' . "\n" .
                '    <clTRID>' . htmlspecialchars($clTRID) . '</clTRID>' . "\n" .
                '  </command>' . "\n" .
                '</epp>';

        return $xml;
    }

    /**
     * Build domain:renew EPP XML.
     */
    public static function renew(string $domain, string $currentExpiryDate, int $years, string $clTRID): string
    {
        $xml = '<?xml version="1.0" encoding="UTF-8" standalone="no"?>' . "\n" .
               '<epp xmlns="urn:ietf:params:xml:ns:epp-1.0">' . "\n" .
               '  <command>' . "\n" .
               '    <renew>' . "\n" .
               '      <domain:renew xmlns:domain="urn:ietf:params:xml:ns:domain-1.0">' . "\n" .
               '        <domain:name>' . htmlspecialchars($domain) . '</domain:name>' . "\n" .
               '        <domain:curExpDate>' . htmlspecialchars($currentExpiryDate) . '</domain:curExpDate>' . "\n" .
               '        <domain:period unit="y">' . (int)$years . '</domain:period>' . "\n" .
               '      </domain:renew>' . "\n" .
               '    </renew>' . "\n" .
               '    <clTRID>' . htmlspecialchars($clTRID) . '</clTRID>' . "\n" .
               '  </command>' . "\n" .
               '</epp>';

        return $xml;
    }

    /**
     * Build domain:transfer EPP XML.
     */
    public static function transfer(string $domain, string $authCode, string $clTRID, string $op = 'request'): string
    {
        $xml = '<?xml version="1.0" encoding="UTF-8" standalone="no"?>' . "\n" .
               '<epp xmlns="urn:ietf:params:xml:ns:epp-1.0">' . "\n" .
               '  <command>' . "\n" .
               '    <transfer op="' . htmlspecialchars($op) . '">' . "\n" .
               '      <domain:transfer xmlns:domain="urn:ietf:params:xml:ns:domain-1.0">' . "\n" .
               '        <domain:name>' . htmlspecialchars($domain) . '</domain:name>' . "\n" .
               '        <domain:authInfo>' . "\n" .
               '          <domain:pw>' . htmlspecialchars($authCode) . '</domain:pw>' . "\n" .
               '        </domain:authInfo>' . "\n" .
               '      </domain:transfer>' . "\n" .
               '    </transfer>' . "\n" .
               '    <clTRID>' . htmlspecialchars($clTRID) . '</clTRID>' . "\n" .
               '  </command>' . "\n" .
               '</epp>';

        return $xml;
    }

    /**
     * Build domain:update EPP XML for nameservers.
     */
    public static function updateNameservers(string $domain, array $add, array $remove, string $clTRID): string
    {
        $xml = '<?xml version="1.0" encoding="UTF-8" standalone="no"?>' . "\n" .
               '<epp xmlns="urn:ietf:params:xml:ns:epp-1.0">' . "\n" .
               '  <command>' . "\n" .
               '    <update>' . "\n" .
               '      <domain:update xmlns:domain="urn:ietf:params:xml:ns:domain-1.0">' . "\n" .
               '        <domain:name>' . htmlspecialchars($domain) . '</domain:name>' . "\n";

        if (!empty($add)) {
            $xml .= '        <domain:add>' . "\n" .
                    '          <domain:ns>' . "\n";
            foreach ($add as $ns) {
                $xml .= '            <domain:hostObj>' . htmlspecialchars($ns) . '</domain:hostObj>' . "\n";
            }
            $xml .= '          </domain:ns>' . "\n" .
                    '        </domain:add>' . "\n";
        }

        if (!empty($remove)) {
            $xml .= '        <domain:rem>' . "\n" .
                    '          <domain:ns>' . "\n";
            foreach ($remove as $ns) {
                $xml .= '            <domain:hostObj>' . htmlspecialchars($ns) . '</domain:hostObj>' . "\n";
            }
            $xml .= '          </domain:ns>' . "\n" .
                    '        </domain:rem>' . "\n";
        }

        $xml .= '      </domain:update>' . "\n" .
                '    </update>' . "\n" .
                '    <clTRID>' . htmlspecialchars($clTRID) . '</clTRID>' . "\n" .
                '  </command>' . "\n" .
                '</epp>';

        return $xml;
    }
}









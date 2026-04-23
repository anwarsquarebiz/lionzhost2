<?php

namespace App\Domain\Epp\Commands;

class EppContactCommands
{
    /**
     * Build contact:check EPP XML.
     */
    public static function check(array $contacts, string $clTRID): string
    {
        $xml = '<?xml version="1.0" encoding="UTF-8" standalone="no"?>' . "\n" .
               '<epp xmlns="urn:ietf:params:xml:ns:epp-1.0">' . "\n" .
               '  <command>' . "\n" .
               '    <check>' . "\n" .
               '      <contact:check xmlns:contact="urn:ietf:params:xml:ns:contact-1.0">' . "\n";

        foreach ($contacts as $contactId) {
            $xml .= '        <contact:id>' . htmlspecialchars($contactId) . '</contact:id>' . "\n";
        }

        $xml .= '      </contact:check>' . "\n" .
                '    </check>' . "\n" .
                '    <clTRID>' . htmlspecialchars($clTRID) . '</clTRID>' . "\n" .
                '  </command>' . "\n" .
                '</epp>';

        return $xml;
    }

    /**
     * Build contact:info EPP XML.
     */
    public static function info(string $contactId, string $clTRID): string
    {
        $xml = '<?xml version="1.0" encoding="UTF-8" standalone="no"?>' . "\n" .
               '<epp xmlns="urn:ietf:params:xml:ns:epp-1.0">' . "\n" .
               '  <command>' . "\n" .
               '    <info>' . "\n" .
               '      <contact:info xmlns:contact="urn:ietf:params:xml:ns:contact-1.0">' . "\n" .
               '        <contact:id>' . htmlspecialchars($contactId) . '</contact:id>' . "\n" .
               '      </contact:info>' . "\n" .
               '    </info>' . "\n" .
               '    <clTRID>' . htmlspecialchars($clTRID) . '</clTRID>' . "\n" .
               '  </command>' . "\n" .
               '</epp>';

        return $xml;
    }

    /**
     * Build contact:create EPP XML.
     */
    public static function create(array $params, string $clTRID): string
    {
        $xml = '<?xml version="1.0" encoding="UTF-8" standalone="no"?>' . "\n" .
               '<epp xmlns="urn:ietf:params:xml:ns:epp-1.0">' . "\n" .
               '  <command>' . "\n" .
               '    <create>' . "\n" .
               '      <contact:create xmlns:contact="urn:ietf:params:xml:ns:contact-1.0">' . "\n" .
               '        <contact:id>' . htmlspecialchars($params['id']) . '</contact:id>' . "\n" .
               '        <contact:postalInfo type="loc">' . "\n" .
               '          <contact:name>' . htmlspecialchars($params['name']) . '</contact:name>' . "\n";

        if (!empty($params['org'])) {
            $xml .= '          <contact:org>' . htmlspecialchars($params['org']) . '</contact:org>' . "\n";
        }

        $xml .= '          <contact:addr>' . "\n" .
                '            <contact:street>' . htmlspecialchars($params['street']) . '</contact:street>' . "\n";

        if (!empty($params['street2'])) {
            $xml .= '            <contact:street>' . htmlspecialchars($params['street2']) . '</contact:street>' . "\n";
        }

        $xml .= '            <contact:city>' . htmlspecialchars($params['city']) . '</contact:city>' . "\n";

        if (!empty($params['sp'])) {
            $xml .= '            <contact:sp>' . htmlspecialchars($params['sp']) . '</contact:sp>' . "\n";
        }

        $xml .= '            <contact:pc>' . htmlspecialchars($params['pc']) . '</contact:pc>' . "\n" .
                '            <contact:cc>' . htmlspecialchars($params['cc']) . '</contact:cc>' . "\n" .
                '          </contact:addr>' . "\n" .
                '        </contact:postalInfo>' . "\n" .
                '        <contact:voice>' . htmlspecialchars($params['voice']) . '</contact:voice>' . "\n";

        if (!empty($params['fax'])) {
            $xml .= '        <contact:fax>' . htmlspecialchars($params['fax']) . '</contact:fax>' . "\n";
        }

        $xml .= '        <contact:email>' . htmlspecialchars($params['email']) . '</contact:email>' . "\n";

        if (!empty($params['authInfo'])) {
            $xml .= '        <contact:authInfo>' . "\n" .
                    '          <contact:pw>' . htmlspecialchars($params['authInfo']) . '</contact:pw>' . "\n" .
                    '        </contact:authInfo>' . "\n";
        }

        $xml .= '      </contact:create>' . "\n" .
                '    </create>' . "\n" .
                '    <clTRID>' . htmlspecialchars($clTRID) . '</clTRID>' . "\n" .
                '  </command>' . "\n" .
                '</epp>';

        return $xml;
    }

    /**
     * Build contact:update EPP XML.
     */
    public static function update(string $contactId, array $changes, string $clTRID): string
    {
        $xml = '<?xml version="1.0" encoding="UTF-8" standalone="no"?>' . "\n" .
               '<epp xmlns="urn:ietf:params:xml:ns:epp-1.0">' . "\n" .
               '  <command>' . "\n" .
               '    <update>' . "\n" .
               '      <contact:update xmlns:contact="urn:ietf:params:xml:ns:contact-1.0">' . "\n" .
               '        <contact:id>' . htmlspecialchars($contactId) . '</contact:id>' . "\n" .
               '        <contact:chg>' . "\n";

        if (!empty($changes['postalInfo'])) {
            $xml .= '          <contact:postalInfo type="loc">' . "\n";
            
            if (isset($changes['postalInfo']['name'])) {
                $xml .= '            <contact:name>' . htmlspecialchars($changes['postalInfo']['name']) . '</contact:name>' . "\n";
            }

            if (isset($changes['postalInfo']['addr'])) {
                $addr = $changes['postalInfo']['addr'];
                $xml .= '            <contact:addr>' . "\n";
                
                if (isset($addr['street'])) {
                    $xml .= '              <contact:street>' . htmlspecialchars($addr['street']) . '</contact:street>' . "\n";
                }
                if (isset($addr['city'])) {
                    $xml .= '              <contact:city>' . htmlspecialchars($addr['city']) . '</contact:city>' . "\n";
                }
                if (isset($addr['pc'])) {
                    $xml .= '              <contact:pc>' . htmlspecialchars($addr['pc']) . '</contact:pc>' . "\n";
                }
                if (isset($addr['cc'])) {
                    $xml .= '              <contact:cc>' . htmlspecialchars($addr['cc']) . '</contact:cc>' . "\n";
                }
                
                $xml .= '            </contact:addr>' . "\n";
            }

            $xml .= '          </contact:postalInfo>' . "\n";
        }

        if (isset($changes['voice'])) {
            $xml .= '          <contact:voice>' . htmlspecialchars($changes['voice']) . '</contact:voice>' . "\n";
        }

        if (isset($changes['email'])) {
            $xml .= '          <contact:email>' . htmlspecialchars($changes['email']) . '</contact:email>' . "\n";
        }

        $xml .= '        </contact:chg>' . "\n" .
                '      </contact:update>' . "\n" .
                '    </update>' . "\n" .
                '    <clTRID>' . htmlspecialchars($clTRID) . '</clTRID>' . "\n" .
                '  </command>' . "\n" .
                '</epp>';

        return $xml;
    }

    /**
     * Build contact:delete EPP XML.
     */
    public static function delete(string $contactId, string $clTRID): string
    {
        $xml = '<?xml version="1.0" encoding="UTF-8" standalone="no"?>' . "\n" .
               '<epp xmlns="urn:ietf:params:xml:ns:epp-1.0">' . "\n" .
               '  <command>' . "\n" .
               '    <delete>' . "\n" .
               '      <contact:delete xmlns:contact="urn:ietf:params:xml:ns:contact-1.0">' . "\n" .
               '        <contact:id>' . htmlspecialchars($contactId) . '</contact:id>' . "\n" .
               '      </contact:delete>' . "\n" .
               '    </delete>' . "\n" .
               '    <clTRID>' . htmlspecialchars($clTRID) . '</clTRID>' . "\n" .
               '  </command>' . "\n" .
               '</epp>';

        return $xml;
    }
}









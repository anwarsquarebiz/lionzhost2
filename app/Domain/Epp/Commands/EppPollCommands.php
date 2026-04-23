<?php

namespace App\Domain\Epp\Commands;

class EppPollCommands
{
    /**
     * Build poll request EPP XML.
     */
    public static function request(string $clTRID): string
    {
        $xml = '<?xml version="1.0" encoding="UTF-8" standalone="no"?>' . "\n" .
               '<epp xmlns="urn:ietf:params:xml:ns:epp-1.0">' . "\n" .
               '  <command>' . "\n" .
               '    <poll op="req"/>' . "\n" .
               '    <clTRID>' . htmlspecialchars($clTRID) . '</clTRID>' . "\n" .
               '  </command>' . "\n" .
               '</epp>';

        return $xml;
    }

    /**
     * Build poll acknowledgement EPP XML.
     */
    public static function ack(string $msgId, string $clTRID): string
    {
        $xml = '<?xml version="1.0" encoding="UTF-8" standalone="no"?>' . "\n" .
               '<epp xmlns="urn:ietf:params:xml:ns:epp-1.0">' . "\n" .
               '  <command>' . "\n" .
               '    <poll op="ack" msgID="' . htmlspecialchars($msgId) . '"/>' . "\n" .
               '    <clTRID>' . htmlspecialchars($clTRID) . '</clTRID>' . "\n" .
               '  </command>' . "\n" .
               '</epp>';

        return $xml;
    }
}









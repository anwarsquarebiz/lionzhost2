import PublicLayout from '@/layouts/public-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { router } from '@inertiajs/react';
import { CheckCircle, Package, ArrowRight } from 'lucide-react';

interface Props {
    session_id?: string;
    order_number?: string;
}

export default function PaymentSuccess({ session_id, order_number }: Props) {
    return (
        <PublicLayout title="Payment Successful">
            <div className="bg-gradient-to-b from-green-50 to-white dark:from-gray-900 dark:to-gray-800 min-h-screen">
                <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
                    <Card className="border-green-200">
                        <CardContent className="p-12 text-center">
                            {/* Success Icon */}
                            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-green-100 dark:bg-green-900">
                                <CheckCircle className="h-12 w-12 text-green-600 dark:text-green-400" />
                            </div>

                            {/* Success Message */}
                            <h1 className="mt-6 text-3xl font-bold text-gray-900 dark:text-white">
                                Payment Successful!
                            </h1>
                            <p className="mt-4 text-lg text-gray-600 dark:text-gray-300">
                                Thank you for your order. Your payment has been processed successfully.
                            </p>

                            {order_number && (
                                <p className="mt-2 text-sm text-gray-500">
                                    Order Number: {order_number}
                                </p>
                            )}
                            
                            {session_id && (
                                <p className="mt-1 text-sm text-gray-500">
                                    Transaction ID: {session_id}
                                </p>
                            )}

                            {/* What's Next */}
                            <div className="mt-8 rounded-lg bg-blue-50 p-6 dark:bg-blue-900/20">
                                <div className="flex items-start gap-3">
                                    <Package className="h-6 w-6 text-blue-600 flex-shrink-0 mt-0.5" />
                                    <div className="text-left">
                                        <h3 className="font-semibold text-gray-900 dark:text-white">
                                            What happens next?
                                        </h3>
                                        <ul className="mt-2 space-y-2 text-sm text-gray-600 dark:text-gray-400">
                                            <li>• You'll receive an order confirmation email shortly</li>
                                            <li>• Domain registrations will be processed immediately</li>
                                            <li>• Hosting services will be provisioned within 24 hours</li>
                                            <li>• You can track your order status in your dashboard</li>
                                        </ul>
                                    </div>
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
                                <Button
                                    size="lg"
                                    onClick={() => router.get('/dashboard')}
                                    className="bg-green-600 hover:bg-green-700"
                                >
                                    View Orders
                                    <ArrowRight className="ml-2 h-4 w-4" />
                                </Button>
                                <Button
                                    variant="outline"
                                    size="lg"
                                    onClick={() => router.get('/')}
                                >
                                    Back to Home
                                </Button>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Additional Info */}
                    <div className="mt-8 text-center">
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                            Need help? Contact our support team at{' '}
                            <a href="mailto:support@lionzhost.com" className="text-blue-600 hover:underline">
                                support@lionzhost.com
                            </a>
                        </p>
                    </div>
                </div>
            </div>
        </PublicLayout>
    );
}

